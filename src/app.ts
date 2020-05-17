import { IncomingMessage, ServerResponse } from 'http';

import Koa from 'koa';
import koaBody from 'koa-bodyparser';
import koaSession from 'koa-session';
import nextApp from 'next';

import sessionLogger from './lib/middlewares/sessionLogger';
import apiRouter from './lib/routes/api';
import * as db from './database';
import Config from './config';
import { timestamp } from './util/time';
import { isUrl } from './util/url';

type ContentSecurityPolicy = {
  [k: string]: string[];
};

const IS_DEV = Config.get('env') === 'dev';
const ONE_DAY_IN_MS = 60 * 60 * 24 * 1000;

export default class Application {
  private static readonly singleton = new Application();

  private readonly port = Config.get('port');
  private readonly csp: ContentSecurityPolicy = {
    'default-src': ['self', 'https://fonts.gstatic.com'],
    'script-src': ['self', 'unsafe-inline', 'unsafe-eval'],
    'style-src': [
      'self',
      'unsafe-inline',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ],
  };
  private clientApp = nextApp({ dir: './client', dev: IS_DEV });
  private pathMap = new Map<string, string[]>();
  private koa = new Koa();

  private constructor() {
    this.koa.keys = ['__newsworthy_app'];
  }

  private get cspHeader(): string {
    let header = '';

    Object.entries(this.csp).forEach(([src, directives]) => {
      const preppedDirectives = directives.map(directive =>
        isUrl(directive) ? directive : `'${directive}'`
      );

      const directiveRule = `${src} ${preppedDirectives.join(' ')}`;

      header += header === '' ? directiveRule : `; ${directiveRule}`;
    });

    return header;
  }

  private attachMiddlewares() {
    const sessionConfig = {
      key: '__app',
      maxAge: ONE_DAY_IN_MS,
      overwrite: true,
      signed: true,
      httpOnly: true,
      autoCommit: false,
    };
    const defaultHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'deny',
      'X-XSS-Protection': '1; mode=block',
    };

    this.koa
      .use(koaSession(sessionConfig, this.koa))
      .use(koaBody())
      .use(async (ctx, next) => {
        ctx.set(defaultHeaders);
        await next();
      })
      .use(sessionLogger())
      .use(apiRouter.routes())
      .use(apiRouter.allowedMethods())
      .on('error', (err, ctx) => {
        const msg = err instanceof Error ? err.stack : err;
        console.error(msg, timestamp(), `URL: ${ctx.url}`);
      });

    this.attachNuxtMiddleware();

    apiRouter.stack.forEach(({ path, methods }) => {
      this.pathMap.set(path, methods);
    });
  }

  private attachNuxtMiddleware() {
    const clientAppHandler: (
      req: IncomingMessage,
      res: ServerResponse
    ) => Promise<void> = this.clientApp.getRequestHandler();
    const defaultNextHeaders = { 'Content-Security-Policy': this.cspHeader };

    this.koa.use(async ctx => {
      ctx.set(defaultNextHeaders);
      await clientAppHandler(ctx.req, ctx.res);
      ctx.respond = false;
    });
  }

  public async setup(): Promise<this> {
    if (IS_DEV) await Promise.all([this.clientApp.prepare(), db.initialize()]);
    else await db.initialize();

    this.attachMiddlewares();

    return this;
  }

  public start(): void {
    this.koa.listen(this.port, () => {
      console.log(`[${timestamp()}] Listening on ${this.port}`);
      console.log(`[${timestamp()}] API Paths: `, this.pathMap);
    });
  }

  public static get instance() {
    return this.singleton;
  }
}
