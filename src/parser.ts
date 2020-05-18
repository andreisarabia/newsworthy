import axios from 'axios';
import { JSDOM } from 'jsdom';
import Mercury, { ParseResult } from '@postlight/mercury-parser';
import striptags from 'striptags';

import ArticleSource from './models/ArticleSource';
import { sanitizeHtml } from './util/sanitizer';
import * as urlUtils from './util/url';
import * as wordsUtils from './util/words';

import * as types from './typings';

export const extractContentFromUrl = async (
  dirtyUrl: string
): Promise<string> => {
  const url = urlUtils.normalizeUrl(dirtyUrl);
  const { data: dirtyHtml }: { data: string } = await axios.get(url);
  const html = sanitizeHtml(dirtyHtml);
  const parsed: ParseResult = await Mercury.parse(url, {
    html: Buffer.from(html, 'utf-8'),
  });

  return parsed.content || '';
};

// gets the first paragraph of a given HTML snippet
const extractDescription = (html: string): string => {
  const p = JSDOM.fragment(html).querySelector('p');

  return p ? p.innerText || striptags(p.innerHTML) : '';
};

export const extractUrlData = async (
  dirtyUrl: string
): Promise<types.NewsArticleProps> => {
  const url = urlUtils.normalizeUrl(dirtyUrl);
  const { data: dirtyHtml } = await axios.get(url);
  const html = sanitizeHtml(dirtyHtml);

  const [parseResult, articleSrc] = await Promise.all([
    Mercury.parse(url, { html: Buffer.from(html, 'utf-8') }),
    ArticleSource.findOne({ url: new URL(url).origin }),
  ]);
  const { content, date_published, ...rest } = parseResult!;
  const description = rest.excerpt || extractDescription(content || '');
  const source = articleSrc
    ? { id: articleSrc.id, name: articleSrc.name }
    : { id: '', name: '' };
  const publishedAt = date_published
    ? new Date(date_published)
    : urlUtils.extractPublishedTime(html) || new Date();
  const wordCount =
    rest.word_count || (content ? wordsUtils.countWords(content) : 0);
  const author = wordsUtils.properCase(
    urlUtils.extractAuthor(html) || rest.author || ''
  );
  const title = urlUtils.extractTitle(html) || rest.title || url;

  return {
    source,
    content,
    publishedAt,
    url,
    author,
    title,
    wordCount,
    urlToImage: rest.lead_image_url,
    description: `${description.trim()}...`,
    domain: urlUtils.extractDomain(url),
    canonicalUrl: urlUtils.extractCanonicalUrl(html) || url,
    slug: urlUtils.extractSlug(url),
    sizeInBytes: Buffer.byteLength(content || ''),
    createdAt: new Date(),
    tags: [],
  };
};
