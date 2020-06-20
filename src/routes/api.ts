import Koa from 'koa';
import KoaRouter from 'koa-router';

import SavedArticle from '../models/SavedArticle';
import Cache from '../Cache';
import Config from '../config';
import * as newsApi from '../api';
import * as utils from '../util';

import * as types from '../typings';

const IS_DEV = Config.get('env') === 'dev';
const ONE_MEG = 1024 * 1024;
const THIRTY_MINUTES = 100 * 60 * 60 * 30;

export const articlesCache = new Cache<
  types.ArticleApiData,
  keyof types.ArticleApiData
>({
  maxSize: ONE_MEG,
  clearInterval: THIRTY_MINUTES,
});

const defaultHeadlineParams = { country: 'us' };
const sendTopHeadlines = async (ctx: Koa.ParameterizedContext) => {
  const params: types.NewsApiHeadlineRequest = ctx.request.body;

  if (!params) ctx.throw(400, 'Cannot fetch top headlines.');

  let articles: types.ArticleApiData[];

  if (utils.isEmptyObject(params)) {
    if (articlesCache.isEmpty) {
      ({ articles } = await newsApi.topHeadlines(defaultHeadlineParams));

      articlesCache.setAll('url', articles);
    } else {
      articles = articlesCache.getAll();
    }
  } else {
    ({ articles } = await newsApi.topHeadlines({
      ...defaultHeadlineParams,
      ...params,
    }));
  }

  ctx.body = { articles };
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

const saveArticle = async (ctx: Koa.ParameterizedContext) => {
  const { url } = ctx.request.body as { url: string | undefined };

  if (url && utils.isUrl(url)) {
    const article = await SavedArticle.addNew(url);

    if (article) {
      ctx.body = { article: article.data };
      return;
    }
  }

  ctx.status = 400;

  ctx.body = {
    msg: 'A provided article link is not valid. Please check your entry.',
  };
};

const addTagsToArticle = async (ctx: Koa.ParameterizedContext) => {
  const { url = '', tags = [] } = ctx.request.body as {
    url: string;
    tags: string[];
  };

  ctx.assert(utils.isUrl(url), 400, 'The provided url is invalid.');
  ctx.assert(
    Array.isArray(tags) && tags.every(utils.isAlphanumeric),
    400,
    'Some tags provided were invalid. Please check all are alphanumeric.'
  );

  const article = await SavedArticle.findOne({ url });

  if (article) {
    await article.addTags(tags).save();

    ctx.body = { tags: article.tags };
  } else {
    ctx.body = { msg: 'Failed to add tags for the provided url.' };
  }
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

const deleteArticleData = async (ctx: Koa.ParameterizedContext) => {
  const { uniqueId } = ctx.params as { uniqueId: string };
  const successful = await SavedArticle.delete(uniqueId);

  ctx.body = { wasSuccessful: successful };
};

const resetAppData = async (ctx: Koa.ParameterizedContext) => {
  if (!IS_DEV) ctx.throw(500, new Error('Forbidden URL.'));

  await SavedArticle.dropCollection(), (ctx.body = 'ok');
};

export default new KoaRouter({ prefix: '/api/article' })
  .post('/news/top-headlines', sendTopHeadlines)
  .post('/news/everything', sendEverything)
  .post('/news/sources', sendSources)
  .post('/save', saveArticle)
  .post('/add-tags', addTagsToArticle)
  .get('/list', findArticles)
  .delete('/:uniqueId', deleteArticleData)
  .get('/reset-all', resetAppData);
