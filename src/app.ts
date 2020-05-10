import Koa from 'koa';
import koaBody from 'koa-bodyparser';
import koaSession from 'koa-session';

import sessionLogger from './lib/middlewares/sessionLogger';
import apiRouter from './lib/routes/api';
import * as db from './database';
import Config from './config';
import { timestamp } from './util/time';

export default class Application {
  private static readonly singleton = new Application();

  private readonly port = Config.get('port');
  private readonly sessionConfig = {
    httpOnly: true,
  };
  private pathMap = new Map<string, string[]>();
  private koa = new Koa();

  private constructor() {
    this.koa.keys = ['__newsworthy_app'];
  }

  private attachMiddlewares() {
    this.koa
      .use(koaBody())
      .use(koaSession(this.sessionConfig, this.koa))
      .use(sessionLogger())
      .use(apiRouter.routes())
      .use(apiRouter.allowedMethods());

    apiRouter.stack.forEach(({ path, methods }) => {
      this.pathMap.set(path, methods);
    });
  }

  public async setup(): Promise<this> {
    await db.initialize();

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
