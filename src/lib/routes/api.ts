import Koa from 'koa';
import KoaRouter from 'koa-router';

import SavedArticle from '../models/SavedArticle';
import * as newsApi from '../api';
import Cache from '../../cache';

import {
  NewsApiHeadlineRequest,
  NewsApiEverythingRequest,
  NewsApiSourcesRequest,
  ArticleApiData,
} from '../../typings';

const { log } = console;

export const articlesCache = new Cache<ArticleApiData>({
  maxSize: 5000,
});

const defaultHeadlineParams = { country: 'us' };

const sendTopHeadlines = async (ctx: Koa.ParameterizedContext) => {
  const params: NewsApiHeadlineRequest = ctx.request.body;
  const data = await newsApi.topHeadlines({
    ...defaultHeadlineParams,
    ...params,
  });

  articlesCache.setAll('url', data.articles);

  ctx.body = { data };
};

const sendEverything = async (ctx: Koa.ParameterizedContext) => {
  const data = await newsApi.everything(
    ctx.request.body as NewsApiEverythingRequest
  );

  articlesCache.setAll('url', data.articles);

  ctx.body = { data };
};

const sendSources = async (ctx: Koa.ParameterizedContext) => {
  const data = await newsApi.sources(ctx.request.body as NewsApiSourcesRequest);

  ctx.body = { data };
};

const saveArticle = async (ctx: Koa.ParameterizedContext) => {
  const { urls } = ctx.request.body as { urls: string | string[] };
  const savedArticles = await SavedArticle.saveArticles(urls);

  ctx.body = { articles: savedArticles.map(article => article.data) };
};

const addTagsToArticle = async (ctx: Koa.ParameterizedContext) => {
  const { url, tags } = ctx.request.body as { url: string; tags: string[] };
  const article = (await SavedArticle.findOne({ url }))!;

  await article.addTags(tags).save();

  ctx.body = { tags: article.tags };
};

const findArticles = async (ctx: Koa.ParameterizedContext) => {
  const { page = 0, perPage = 10 } = ctx.request.query as {
    page: number;
    perPage: number;
  };
  const articles = await SavedArticle.findAll({
    limit: perPage,
    skip: page * perPage,
  });

  ctx.body = { articles: articles.map(article => article.data) };
};

export default new KoaRouter({ prefix: '/api/article' })
  .post('/top-headlines', sendTopHeadlines)
  .post('/everything', sendEverything)
  .post('/sources', sendSources)
  .post('/save', saveArticle)
  .post('/add-tags', addTagsToArticle)
  .get('/find', findArticles)
  .get('/ping', ctx => {
    ctx.body = 'ok';
  });
