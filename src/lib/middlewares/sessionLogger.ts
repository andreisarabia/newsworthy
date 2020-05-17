import Koa from 'koa';
import chalk from 'chalk';

import { isoTimestamp } from '../../util/time';
import Config from '../../config';

const FILE_TYPES = ['_next', '.ico', '.json', '.png', '.jpeg'];
const IS_DEV = Config.get('env') === 'dev';
const { log } = console;

const isNextFile = (path: string) =>
  FILE_TYPES.some(type => path.includes(type));

const logRequest = (ctx: Koa.ParameterizedContext, xResponseTime: string) => {
  const { ip, method, url, status } = ctx;
  const { 'user-agent': ua, referer = '' } = ctx.header;
  const timestamp = isoTimestamp();

  let logMsg = `${ip} - [${timestamp}] ${method} ${url} ${status} ${xResponseTime}`;
  if (referer) logMsg += ` ${referer}`;
  logMsg += ` ${ua}`;

  if (status >= 500) log(chalk.magenta(logMsg));
  else if (status >= 400) log(chalk.red(logMsg));
  else if (status >= 300) log(chalk.inverse(logMsg));
  else if (isNextFile(ctx.path)) log(chalk.cyan(logMsg));
  else log(chalk.green(logMsg));
};

export default () => async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
  const start = Date.now();
  const { path } = ctx;

  try {
    if (isNextFile(path)) return await next(); // handled by Next

    await ctx.session.manuallyCommit();

    if (!path.startsWith('/api'))
      ctx.session.views = ctx.session.views + 1 || 1; // count non-API calls as a `view`

    await next();
  } finally {
    const xResponseTime = `${Date.now() - start}ms`;

    if (IS_DEV) ctx.set('X-Response-Time', xResponseTime);

    logRequest(ctx, xResponseTime);
  }
};
