import qs from 'querystring';

import axios from 'axios';

import Config from '../config';
import Parser from '../Parser';
import cloudinary from '../services/cloudinary';
import * as utils from '../util';

import * as types from '../typings';

// https://newsapi.org/docs/endpoints
type ApiEndpoint = '/top-headlines' | '/everything' | '/sources';

const api = axios.create({
  baseURL: 'https://newsapi.org/v2',
  headers: { 'X-Api-Key': Config.get('newsApiKey') },
});

const populateEmptyContent = async (
  articles: types.ArticleApiData[]
): Promise<types.ArticleApiData[]> => {
  // urls are infrequently malformed, so we only return articles that
  // have a working URL and isn't YouTube (can't parse it otherwise)
  articles = articles.filter(
    ({ url }) =>
      url.includes('.com/') && !utils.extractDomain(url).includes('youtube.com')
  );

  const populatedContent: types.ArticleApiData[] = [];
  const cloudinaryImages: string[][] = [];

  // the News API only responds with some of the content of an article,
  // so we have to get that manually using Mercury Parser
  const articlePopulator = async (article: types.ArticleApiData) => {
    article.content = await Parser.extractContentFromUrl(article.url);
    populatedContent.push(article);
  };

  const imageUploader = async ({ urlToImage, url }: types.ArticleApiData) => {
    if (urlToImage) {
      const { secure_url } = await cloudinary.uploader.upload(urlToImage);
      cloudinaryImages.push([url, secure_url]);
    } else {
      cloudinaryImages.push([url, '']);
    }
  };

  await Promise.all([
    utils.parallelize(articles, 5, articlePopulator),
    utils.parallelize(articles, 10, imageUploader),
  ]);

  return populatedContent.map(article => {
    const [, urlToImage] = cloudinaryImages.find(
      ([url]) => url === article.url
    )!;

    if (urlToImage) article.urlToImage = urlToImage;

    return article;
  });
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
  params: types.NewsApiHeadlineRequest = {}
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
  params: types.NewsApiSourcesRequest = {}
): Promise<types.NewsApiSourcesResponse> =>
  (await queryApi('/sources', params)).data;
