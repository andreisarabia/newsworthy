import qs from 'querystring';

import axios, { AxiosResponse } from 'axios';

import { extractContentFromUrl } from '../../parser';
import ArticleSource from '../models/ArticleSource';
import Config from '../../config';

import {
  ApiRequest,
  ArticleApiData,
  NewsApiHeadlineRequest,
  NewsApiHeadlineResponse,
  NewsApiEverythingRequest,
  NewsApiEverythingResponse,
  NewsApiSourcesRequest,
  NewsApiSourcesResponse,
} from '../../typings';

const { log } = console;

// https://newsapi.org/docs/endpoints
const api = axios.create({
  baseURL: 'https://newsapi.org/v2',
  headers: {
    'X-Api-Key': Config.get('newsApiKey'),
  },
});

const queryApi = (
  uri: string,
  params?: ApiRequest
): Promise<AxiosResponse<any>> => {
  if (params) uri += `?${qs.stringify({ ...params })}`;
  return api.get(uri);
};

const populateEmptyContent = (
  articles: ArticleApiData[]
): Promise<ArticleApiData[]> =>
  Promise.all(
    articles.map(async (data: ArticleApiData) => {
      if (!data.content) data.content = await extractContentFromUrl(data.url);

      return { ...data };
    })
  );

/**
 * Provides live top and breaking headlines for a country,
 * specific category in a country, single source, or multiple
 * sources. Sorted by the earliest date published first.
 */
export const topHeadlines = async (
  params?: NewsApiHeadlineRequest
): Promise<NewsApiHeadlineResponse> => {
  const { data }: { data: NewsApiHeadlineResponse } = await queryApi(
    '/top-headlines',
    params
  );
  const articles = await populateEmptyContent(data.articles);

  return { ...data, articles };
};

export const everything = async (
  params?: NewsApiEverythingRequest
): Promise<NewsApiEverythingResponse> => {
  const { data }: { data: NewsApiEverythingResponse } = await queryApi(
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
  params?: NewsApiSourcesRequest
): Promise<NewsApiSourcesResponse> => {
  const { data }: { data: NewsApiSourcesResponse } = await queryApi(
    '/sources',
    params
  );

  ArticleSource.saveSources(data.sources);

  return data;
};
