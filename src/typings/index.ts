type ISOFormattedTime = string;

type NewsCategory =
  | 'business'
  | 'entertainment'
  | 'general'
  | 'health'
  | 'science'
  | 'sports'
  | 'technology';

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
  publishedAt: ISOFormattedTime;
  content: string | null;
}

export interface NewsArticleProps extends ArticleApiData {
  domain: string;
  canonicalUrl: string;
  slug: string;
  sizeInBytes: number;
  createdAt: Date;
  tags: string[];
}

export interface ArticleSourceProps {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  language: string;
  country: string;
}

export interface ApiRequest {}

export interface NewsApiHeadlineRequest extends ApiRequest {
  country?: string;
  category?: NewsCategory;
  q?: string;
  pageSize?: number; // default 20
  page?: number;
}

export interface NewsApiEverythingRequest
  extends ApiRequest,
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

export interface NewsApiSourcesRequest extends ApiRequest {
  category?: NewsCategory;
  language?: string;
  country?: string; // default is all countries
}

export interface NewsApiHeadlineResponse {
  status: 'ok' | 'error';
  code?: 'apiKeyMissing';
  message?: 'string';
  totalResults?: number;
  articles: ArticleApiData[];
}

export interface NewsApiEverythingResponse extends NewsApiHeadlineResponse {
  articles: Omit<ArticleApiData, 'urlToImage'>[];
}

export interface NewsApiSourcesResponse {
  status: 'ok' | 'error';
  sources: ArticleSourceProps[];
}
