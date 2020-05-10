import axios from 'axios';
import Mercury, { ParseResult } from '@postlight/mercury-parser';
import striptags from 'striptags';

import ArticleSource from './lib/models/ArticleSource';
import { sanitizeHtml } from './util/sanitizer';
import {
  cleanUrl,
  extractAuthor,
  extractCanonicalUrl,
  extractDomain,
  extractSlug,
  extractTitle,
  extractPublishedTime,
} from './util/url';

import { NewsArticleProps } from './typings';

export const extractContentFromUrl = async (url: string): Promise<string> => {
  const cleanedUrl = cleanUrl(url);
  const { data: dirtyHtml }: { data: string } = await axios.get(cleanedUrl);
  const html = sanitizeHtml(dirtyHtml, { ADD_TAGS: ['link'] });
  const parsed: ParseResult = await Mercury.parse(cleanedUrl, {
    html: Buffer.from(html, 'utf-8'),
  });

  return parsed.content || '';
};

export const extractUrlData = async (
  url: string
): Promise<NewsArticleProps> => {
  const cleanedUrl = cleanUrl(url);
  const { data: dirtyHtml } = await axios.get(cleanedUrl);
  const html = sanitizeHtml(dirtyHtml, { ADD_TAGS: ['link'] });
  const [parseResult, articleSrc] = await Promise.all([
    Mercury.parse(cleanedUrl, { html: Buffer.from(html, 'utf-8') }),
    ArticleSource.findOne({ url: new URL(url).origin }),
  ]);

  const { content, date_published, ...rest } = parseResult!;
  const source = articleSrc
    ? { id: articleSrc.id, name: articleSrc.name }
    : { id: '', name: '' };
  const description =
    rest.excerpt || (content ? `${striptags(content).slice(0, 80)}...` : '');
  const publishedAt = date_published
    ? new Date(date_published)
    : extractPublishedTime(html) || new Date();

  return {
    source,
    content,
    author: rest.author || extractAuthor(html) || '',
    title: rest.title || extractTitle(html) || cleanedUrl,
    description,
    url: cleanedUrl,
    urlToImage: rest.lead_image_url,
    publishedAt,
    domain: extractDomain(cleanedUrl),
    canonicalUrl: extractCanonicalUrl(html) || cleanedUrl,
    slug: extractSlug(cleanedUrl),
    sizeInBytes: Buffer.byteLength(content || ''),
    createdAt: new Date(),
    tags: [],
  };
};
