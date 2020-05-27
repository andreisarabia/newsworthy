import qs from 'querystring';

import axios, { AxiosResponse } from 'axios';

import Config from '../Config';
import Parser from '../Parser';

import * as types from '../typings';

// https://newsapi.org/docs/endpoints
const api = axios.create({
  baseURL: 'https://newsapi.org/v2',
  headers: {
    'X-Api-Key': Config.get('newsApiKey'),
  },
});

const populateEmptyContent = (
  articles: types.ArticleApiData[]
): Promise<types.ArticleApiData[]> =>
  Promise.all(
    articles.map(async (data: types.ArticleApiData) => {
      if (!data.content)
        data.content = await Parser.extractContentFromUrl(data.url);

      return { ...data };
    })
  );

const queryApi = async (
  uri: '/top-headlines' | '/everything' | '/sources',
  params?: types.ApiRequest
): Promise<AxiosResponse<any>> => {
  const url = params ? `${uri}?${qs.stringify({ ...params })}` : uri;
  const response = await api.get(url);

  if (uri === '/top-headlines' || uri === '/everything')
    response.data.articles = await populateEmptyContent(
      response.data.articles as types.ArticleApiData[]
    );

  return response;
};

/**
 * Provides live top and breaking headlines for a country,
 * specific category in a country, single source, or multiple
 * sources. Sorted by the earliest date published first.
 */
export const topHeadlines = async (
  params?: types.NewsApiHeadlineRequest
): Promise<types.NewsApiHeadlineResponse> =>
  (await queryApi('/top-headlines', params)).data;

export const everything = async (
  params?: types.NewsApiEverythingRequest
): Promise<types.NewsApiEverythingResponse> =>
  (await queryApi('/everything', params)).data;

/**
 * Returns the subset of news publishers that top headlines
 * are available from.
 */
export const sources = async (
  params?: types.NewsApiSourcesRequest
): Promise<types.NewsApiSourcesResponse> =>
  (await queryApi('/sources', params)).data;
