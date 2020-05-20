import http from 'http';

import Koa from 'koa';
import koaBody from 'koa-bodyparser';
import koaSession from 'koa-session';
import nextApp from 'next';

import sessionLogger from './middlewares/sessionLogger';
import apiRouter from './routes/api';
import Database from './Database';
import Config from './Config';
import Parser from './Parser';
import { timestamp } from './util/time';
import { isUrl } from './util/url';

type ContentSecurityPolicy = {
  [k: string]: string[];
};

const ONE_DAY_IN_MS = 60 * 60 * 24 * 1000;
const isDev = Config.get('env') === 'dev';
const shouldCompile = isDev && !process.argv.includes('no-compile');

export default class Application {
  private static readonly singleton = new Application();

  private readonly port = Config.get('port');
  private readonly csp: ContentSecurityPolicy = {
    'default-src': ['self'],
    'script-src': ['self', 'unsafe-inline', 'unsafe-eval'],
    'style-src': ['self', 'unsafe-inline'],
  };
  private clientApp = nextApp({ dir: './client', dev: isDev });
  private pathMap = new Map<string, string[]>();
  private koa = new Koa();
  private startupMessages: string[] = [];

  private constructor() {
    this.koa.keys = ['__newsworthy_app'];
  }

  private get cspHeader(): string {
    return Object.entries(this.csp).reduce((acc, [src, directives], i) => {
      const preppedDirectives = directives.map(directive =>
        isUrl(directive) ? directive : `'${directive}'`
      );
      const directiveRule = `${src} ${preppedDirectives.join(' ')}`;

      return i === 0 ? directiveRule : `${acc}; ${directiveRule}`;
    }, '');
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
        console.error(
          err instanceof Error ? err.stack || err.message : err,
          ctx.url
        );
      });

    this.attachNuxtMiddleware();

    apiRouter.stack.forEach(({ path, methods }) => {
      this.pathMap.set(path, methods);
    });
  }

  private attachNuxtMiddleware() {
    const clientAppHandler: (
      req: http.IncomingMessage,
      res: http.ServerResponse
    ) => Promise<void> = this.clientApp.getRequestHandler();
    const defaultNextHeaders = { 'Content-Security-Policy': this.cspHeader };

    this.koa.use(async ctx => {
      ctx.set(defaultNextHeaders);
      await clientAppHandler(ctx.req, ctx.res);
      ctx.respond = false;
    });
  }

  private async initializeNuxtApp() {
    const start = Date.now();
    if (shouldCompile) await this.clientApp.prepare();
    this.startupMessages.push(`${Date.now() - start}ms to start Next.js.`);
  }

  private async initializeDatabase() {
    const start = Date.now();
    await Parser.initialize();
    this.startupMessages.push(
      `${Date.now() - start}ms to connect to database.`
    );
  }

  private async initializeParser() {
    const start = Date.now();
    await Database.initialize();
    this.startupMessages.push(`${Date.now() - start}ms to prep browsers.`);
  }

  public async setup(): Promise<this> {
    await Promise.all([
      this.initializeNuxtApp(),
      this.initializeParser(),
      this.initializeDatabase(),
    ]);

    this.attachMiddlewares();

    return this;
  }

  public start(): void {
    this.koa.listen(this.port, () => {
      console.log(
        `[${timestamp()}]`,
        `\nListening on port ${this.port}...\n`,
        'API Paths: ',
        this.pathMap,
        `\n${this.startupMessages.join('\n')}`
      );
    });
  }

  public static get instance() {
    return this.singleton;
  }
}