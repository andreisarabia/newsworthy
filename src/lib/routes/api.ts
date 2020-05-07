import KoaRouter from 'koa-router';

import SavedArticle from '../models/SavedArticle';
import * as newsApi from '../api';

import {
  NewsApiHeadlineRequest,
  NewsApiEverythingRequest,
  NewsApiSourcesRequest,
} from '../../typings';

export default new KoaRouter({ prefix: '/api/article' })
  .post('/top-headlines', async ctx => {
    const data = await newsApi.topHeadlines(
      ctx.request.body as NewsApiHeadlineRequest
    );

    ctx.body = { data };
  })
  .post('/everything', async ctx => {
    const data = await newsApi.everything(
      ctx.request.body as NewsApiEverythingRequest
    );

    ctx.body = { data };
  })
  .post('/sources', async ctx => {
    const data = await newsApi.sources(
      ctx.request.body as NewsApiSourcesRequest
    );

    ctx.body = { data };
  })
  .post('/save', async ctx => {
    const { urls } = ctx.request.body as { urls: string | string[] };
    const savedArticles = await SavedArticle.saveArticles(urls);

    ctx.body = { articles: savedArticles.map(article => article.data) };
  })
  .post('/saved', async ctx => {
    const { page = 0, perPage = 10 } = ctx.request.body as {
      page: number;
      perPage: number;
    };
    const articles = await SavedArticle.findAll({
      limit: perPage,
      skip: page * perPage,
    });

    ctx.body = { articles: articles.map(article => article.data) };
  })
  .post('/add-tags', async ctx => {
    const { url, tags } = ctx.request.body as { url: string; tags: string[] };
    const article = (await SavedArticle.findOne({ url }))!;

    await article.addTags(tags).save();

    ctx.body = { tags: article.tags };
  });
