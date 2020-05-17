import Koa from 'koa';
import KoaRouter from 'koa-router';

import SavedArticle from '../models/SavedArticle';
import ArticleSource from '../models/ArticleSource';
import * as newsApi from '../api';
import Cache from '../../cache';
import Config from '../../config';
import { isUrl } from '../../util/url';
import { isAlphanumeric } from '../../util/is';

import * as types from '../../typings';

const IS_DEV = Config.get('env') === 'dev';
const { log } = console;

export const articlesCache = new Cache<types.ArticleApiData>({
  maxSize: 5000,
});

const defaultHeadlineParams = { country: 'us' };

const sendTopHeadlines = async (ctx: Koa.ParameterizedContext) => {
  const params: types.NewsApiHeadlineRequest = ctx.request.body;
  const data = await newsApi.topHeadlines({
    ...defaultHeadlineParams,
    ...params,
  });

  articlesCache.setAll('url', data.articles);

  ctx.body = { data };
};

const sendEverything = async (ctx: Koa.ParameterizedContext) => {
  const params: types.NewsApiEverythingRequest = ctx.request.body;
  const data = await newsApi.everything(params);

  articlesCache.setAll('url', data.articles);

  ctx.body = { data };
};

const sendSources = async (ctx: Koa.ParameterizedContext) => {
  const params: types.NewsApiSourcesRequest = ctx.request.body;
  const data = await newsApi.sources(params);

  ctx.body = { data };
};

const saveArticles = async (ctx: Koa.ParameterizedContext) => {
  const { urls = [] } = ctx.request.body as { urls: string[] };

  ctx.assert(
    Array.isArray(urls) && urls.every(isUrl),
    400,
    'A provided article link is not valid. Please check your entries.'
  );

  const savedArticles = await SavedArticle.saveAll(urls);
  const articles = savedArticles.map(article => article.data);

  ctx.body = { count: articles.length, articles };
};

const addTagsToArticle = async (ctx: Koa.ParameterizedContext) => {
  const { url = '', tags = [] } = ctx.request.body as {
    url: string;
    tags: string[];
  };

  ctx.assert(isUrl(url), 400, 'The provided url is invalid.');
  ctx.assert(
    Array.isArray(tags) && tags.every(isAlphanumeric),
    400,
    'Some tags provided were invalid. Please check all are alphanumeric.'
  );

  const article = (await SavedArticle.findOne({ url }))!;

  await article.addTags(tags).save();

  ctx.body = { tags: article.tags };
};

const findArticles = async (ctx: Koa.ParameterizedContext) => {
  const { perPage, page } = ctx.request.query as {
    perPage?: string;
    page?: string;
  };

  let limit: number;
  let skip: number;

  if (!perPage || !Number.isInteger(+perPage)) limit = 10;
  else limit = +perPage;

  if (!page || !Number.isInteger(+page)) skip = 0;
  else skip = +page * limit;

  const savedArticles = await SavedArticle.findAll({}, { limit, skip });
  const articles = savedArticles.map(article => article.data);

  ctx.body = { count: articles.length, articles };
};

const sendArticleSources = async (ctx: Koa.ParameterizedContext) => {
  const savedSources = await ArticleSource.findAll();
  const sources = savedSources.map(source => source.data);

  ctx.body = { count: sources.length, sources };
};

export default new KoaRouter({ prefix: '/api/article' })
  .post('/news/top-headlines', sendTopHeadlines)
  .post('/news/everything', sendEverything)
  .post('/news/sources', sendSources)
  .post('/save', saveArticles)
  .post('/add-tags', addTagsToArticle)
  .get('/list', findArticles)
  .get('/sources', sendArticleSources)
  .get('/reset-all', async ctx => {
    ctx.throw(500, new Error('Forbidden URL.'));

    if (!IS_DEV) ctx.throw(500, new Error('Forbidden URL.'));

    await Promise.all([
      SavedArticle.dropCollection(),
      ArticleSource.dropCollection(),
    ]);

    ctx.body = 'ok';
  });
