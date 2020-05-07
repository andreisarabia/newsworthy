import axios from 'axios';
import Mercury, { ParseResult } from '@postlight/mercury-parser';

import ArticleSource from './lib/models/ArticleSource';
import { sanitizeHtml } from './util/sanitizer';
import {
  cleanUrl,
  extractCanonicalUrl,
  extractDomain,
  extractSlug,
  extractTitle,
} from './util/url';
import { isoTimestamp } from './util/time';

import { NewsArticleProps } from './typings';

export const extractContentFromUrl = async (url: string): Promise<string> => {
  const cleanedUrl = cleanUrl(url);
  const { data: dirtyHtml }: { data: string } = await axios.get(cleanedUrl);
  const html = sanitizeHtml(dirtyHtml, { ADD_TAGS: ['link'] });
  const parsed: ParseResult = await Mercury.parse(cleanedUrl, {
    html: Buffer.from(html, 'utf-8'),
  });

  return parsed.content || 'Failed to parse article content.';
};

export const extractUrlData = async (
  url: string
): Promise<NewsArticleProps> => {
  const cleanedUrl = cleanUrl(url);
  const { data: dirtyHtml }: { data: string } = await axios.get(cleanedUrl);
  const html = sanitizeHtml(dirtyHtml, { ADD_TAGS: ['link'] });
  const { content, ...rest }: ParseResult = await Mercury.parse(cleanedUrl, {
    html: Buffer.from(html, 'utf-8'),
  });
  const articleSrc = await ArticleSource.findOne({ url });
  const source = articleSrc
    ? { id: articleSrc.id, name: articleSrc.name }
    : { id: '', name: '' };

  return {
    source,
    content,
    author: rest.author || '',
    title: rest.title || extractTitle(html) || cleanedUrl,
    description: rest.excerpt || (content ? `${content.slice(0, 55)}...` : ''),
    url: cleanedUrl,
    urlToImage: '',
    publishedAt: rest.date_published || isoTimestamp(),
    domain: extractDomain(cleanedUrl),
    canonicalUrl: extractCanonicalUrl(html) || cleanedUrl,
    slug: extractSlug(cleanedUrl),
    sizeInBytes: Buffer.byteLength(content || ''),
    createdAt: new Date(),
    tags: [],
  };
};
