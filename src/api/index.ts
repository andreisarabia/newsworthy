import qs from 'querystring';

import axios from 'axios';

import Config from '../config';
import Parser from '../Parser';
import * as utils from '../util';

import * as types from '../typings';

// https://newsapi.org/docs/endpoints
type ApiEndpoint = '/top-headlines' | '/everything' | '/sources';

const api = axios.create({
  baseURL: 'https://newsapi.org/v2',
  headers: {
    'X-Api-Key': Config.get('newsApiKey'),
  },
});

const populateEmptyContent = async (
  articles: types.ArticleApiData[]
): Promise<types.ArticleApiData[]> => {
  articles = articles.filter(
    ({ url }) => !utils.extractDomain(url).includes('youtube.com')
  );

  const populatedContent: types.ArticleApiData[] = [];

  await utils.parallelize(articles, 15, async article => {
    article.content = await Parser.extractContentFromUrl(article.url);
    populatedContent.push(article);
  });

  return populatedContent;
};

const queryApi = async <
  T extends types.NewsApiRequest,
  K extends types.NewsApiResponse
>(
  path: ApiEndpoint,
  params?: T
): Promise<K> => {
  const url = params ? `${path}?${qs.stringify(params)}` : path;
  const response = await api.get(url);
  return response.data;
};

/**
 * Provides live top and breaking headlines for a country,
 * specific category in a country, single source, or multiple
 * sources. Sorted by the earliest date published first.
 */
export const topHeadlines = async (
  params?: types.NewsApiHeadlineRequest
): Promise<types.NewsApiHeadlineResponse> => {
  const data: types.NewsApiHeadlineResponse = await queryApi(
    '/top-headlines',
    params
  );
  const articles = await populateEmptyContent(data.articles);

  return { ...data, articles };
};

export const everything = async (
  params?: types.NewsApiEverythingRequest
): Promise<types.NewsApiEverythingResponse> => {
  const data: types.NewsApiEverythingResponse = await queryApi(
    '/everything',
    params
  );
  const articles = await populateEmptyContent(data.articles);

  return { ...data, articles };
};

/**
 * Returns the subset of news publishers that top headlines
 * are available from.
 */
export const sources = async (
  params?: types.NewsApiSourcesRequest
): Promise<types.NewsApiSourcesResponse> =>
  (await queryApi('/sources', params)).data;
