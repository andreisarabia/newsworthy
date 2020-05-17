import qs from 'querystring';

import axios, { AxiosResponse } from 'axios';

import { extractContentFromUrl } from '../../parser';
import ArticleSource from '../models/ArticleSource';
import Config from '../../config';

import * as types from '../../typings';

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
  params?: types.ApiRequest
): Promise<AxiosResponse<any>> => {
  if (params) uri += `?${qs.stringify({ ...params })}`;
  return api.get(uri);
};

const populateEmptyContent = (
  articles: types.ArticleApiData[]
): Promise<types.ArticleApiData[]> =>
  Promise.all(
    articles.map(async (data: types.ArticleApiData) => {
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
  params?: types.NewsApiHeadlineRequest
): Promise<types.NewsApiHeadlineResponse> => {
  const { data }: { data: types.NewsApiHeadlineResponse } = await queryApi(
    '/top-headlines',
    params
  );
  const articles = await populateEmptyContent(data.articles);

  return { ...data, articles };
};

export const everything = async (
  params?: types.NewsApiEverythingRequest
): Promise<types.NewsApiEverythingResponse> => {
  const { data }: { data: types.NewsApiEverythingResponse } = await queryApi(
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
): Promise<types.NewsApiSourcesResponse> => {
  const { data }: { data: types.NewsApiSourcesResponse } = await queryApi(
    '/sources',
    params
  );

  ArticleSource.saveAll(data.sources);

  return data;
};
