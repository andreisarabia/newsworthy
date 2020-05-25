export interface SavedArticle {
  uniqueId: string;
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage?: string | null;
  publishedAt: Date;
  content: string | null;
  wordCount: number;
  domain: string;
  canonical: string;
  slug: string;
  sizeInBytes: number;
  createdAt: Date;
  tags: string[];
  source: {
    id: string | null;
    name: string | null;
  };
}

export interface SavedArticleProps {
  list: SavedArticle[];
}
