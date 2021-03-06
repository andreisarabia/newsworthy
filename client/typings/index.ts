export interface SavedArticle {
  uniqueId: string;
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage?: string | null;
  publishedAt: string;
  content: string | null;
  wordCount: number;
  domain: string;
  canonical: string;
  slug: string;
  sizeInBytes: number;
  createdAt: string;
  tags: string[];
  source: {
    id: string | null;
    name: string | null;
  };
}

export interface NewsArticleApiData {
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

export type ReaderViewSettings = {
  fontSize: string;
  color?: string;
  backgroundColor: string;
  lineHeight: string;
  width: string;
};
