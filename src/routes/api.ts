import Koa from 'koa';
import KoaRouter from '@koa/router';

import SavedArticle from '../models/SavedArticle';
import Config from '../config';
import redis from '../cache/redis';
import * as newsApi from '../api';
import * as utils from '../util';

import * as types from '../typings';

const IS_DEV = Config.get('env') === 'dev';
const CACHE_RESET_INTERVAL = Config.get('newsApiResetInterval');

const cache = {
  getArticles(): Promise<types.ArticleApiData[] | null> {
    return new Promise((resolve, reject) => {
      redis.get('cached_articles', (err, articles) => {
        if (err) reject(err);
        else if (articles) resolve(JSON.parse(articles));
        else resolve(null);
      });
    });
  },
  setArticles(articles: types.ArticleApiData[]): Promise<void> {
    return new Promise((resolve, reject) => {
      redis.setex(
        'cached_articles',
        CACHE_RESET_INTERVAL,
        JSON.stringify(articles),
        err => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },
};

const sendTopHeadlines = async (ctx: Koa.ParameterizedContext) => {
  let articles: types.ArticleApiData[] | null = await cache.getArticles();

  if (articles) {
    ctx.body = articles;
    return;
  }

  articles = (await newsApi.topHeadlines({ country: 'us' })).articles;

  await cache.setArticles(articles);

  ctx.body = articles;
};

const sendEverything = async (ctx: Koa.ParameterizedContext) => {
  const params: types.NewsApiEverythingRequest = ctx.request.body;
  const data = await newsApi.everything(params);

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

const sendArticleData = async (ctx: Koa.ParameterizedContext) => {
  const { articleId } = ctx.params as { articleId: string };
  const article = await SavedArticle.findOne({ uniqueId: articleId });

  ctx.body = { article: article?.data };
};

const deleteArticleData = async (ctx: Koa.ParameterizedContext) => {
  const { uniqueId } = ctx.params as { uniqueId: string };
  const successful = await SavedArticle.delete(uniqueId);

  ctx.body = { wasSuccessful: successful };
};

const resetAppData = async (ctx: Koa.ParameterizedContext) => {
  if (!IS_DEV) ctx.throw(500, new Error('Forbidden URL.'));

  await SavedArticle.dropCollection();

  ctx.body = 'ok';
};

export default new KoaRouter({ prefix: '/api/article' })
  .post('/news/top-headlines', sendTopHeadlines)
  .post('/news/everything', sendEverything)
  .post('/news/sources', sendSources)
  .post('/save', saveArticle)
  .post('/add-tags', addTagsToArticle)
  .get('/list', findArticles)
  .get('/:articleId', sendArticleData)
  .delete('/:uniqueId', deleteArticleData)
  .get('/reset-all', resetAppData);
