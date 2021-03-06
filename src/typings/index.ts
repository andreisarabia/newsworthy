import { ObjectId } from 'mongodb';

type ISOFormattedTime = string;

type NewsCategory =
  | 'business'
  | 'entertainment'
  | 'general'
  | 'health'
  | 'science'
  | 'sports'
  | 'technology';

export interface MongoModelProps {
  _id?: ObjectId;
  uniqueId?: string; // for clientside rendering (e.g. loops)
}

export interface ArticleApiData {
  source: {
    id: string | null;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage?: string | null;
  publishedAt: string;
  content: string | null;
  wordCount: number;
}

export interface NewsArticleProps extends MongoModelProps, ArticleApiData {
  domain: string;
  canonical: string;
  slug: string;
  sizeOfArticlePage: number;
  sizeOfArticle: number;
  articleToPageSizeRatio: number;
  createdAt: string;
  tags: string[];
}

export interface ArticleSourceProps extends MongoModelProps {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  language: string;
  country: string;
}

export interface NewsApiRequest {
  [key: string]: any;
}

export interface NewsApiResponse {
  [key: string]: any;
}

export interface NewsApiHeadlineRequest extends NewsApiRequest {
  country?: string;
  category?: NewsCategory;
  q?: string;
  pageSize?: number; // default 20
  page?: number;
}

export interface NewsApiEverythingRequest
  extends NewsApiRequest,
    Pick<NewsApiHeadlineRequest, 'q' | 'pageSize' | 'page'> {
  qInTitle: string;
  sources: string;
  domains: string;
  excludeDomains: string;
  from: ISOFormattedTime;
  to: ISOFormattedTime;
  language: string;
  sortBy: 'relevancy' | 'popularity' | 'publishedAt' /* default */;
}

export interface NewsApiSourcesRequest extends NewsApiRequest {
  category?: NewsCategory;
  language?: string;
  country?: string; // default is all countries
}

export interface NewsApiHeadlineResponse extends NewsApiResponse {
  status: 'ok' | 'error';
  code?: 'apiKeyMissing';
  message?: 'string';
  totalResults?: number;
  articles: ArticleApiData[];
}

export interface NewsApiEverythingResponse extends NewsApiHeadlineResponse {
  articles: Omit<ArticleApiData, 'urlToImage'>[];
}

export interface NewsApiSourcesResponse extends NewsApiResponse {
  status: 'ok' | 'error';
  sources: ArticleSourceProps[];
}
