import axios from 'axios';
import { JSDOM } from 'jsdom';
import Mercury, { ParseResult } from '@postlight/mercury-parser';
import striptags from 'striptags';
import he from 'he'; // hehehe

import ArticleSource from './models/ArticleSource';
import * as utils from './util';

import * as types from './typings';

export default class Parser {
  public static async extractUrlData(
    dirtyUrl: string
  ): Promise<types.NewsArticleProps> {
    const url = utils.normalizeUrl(dirtyUrl);
    const dirtyHtml = he.decode(await this.getWebpageHtml(url));
    const html = utils.sanitizeHtml(dirtyHtml);
    const meta = utils.extractMetaContent(
      dirtyHtml, // extract meta here because sanitization removes some properties
      'author',
      'description',
      'og:description',
      'og:title',
      'twitter:title',
      'twitter:description',
      'og:image',
      'twitter:image',
      'article:published_time',
      'article:modified_time'
    );
    const [parseResult, articleSrc] = await Promise.all([
      Mercury.parse(url, { html: Buffer.from(html) }),
      ArticleSource.findOne({ url: new URL(url).origin }),
    ]);

    const { content, ...rest } = parseResult!;
    const sizeOfArticlePage = Buffer.byteLength(html);
    const sizeOfArticle = Buffer.byteLength(content || '');
    const urlToImage = meta['og:image'] || meta['twitter:image'];
    const title = meta['og:title'] || meta['twitter:title'] || rest.title;

    const source = articleSrc
      ? { id: articleSrc.id, name: articleSrc.name }
      : { id: '', name: '' };
    const publishedAt =
      meta['article:published_time'] ||
      meta['article:modified_time'] ||
      rest.date_published;
    const description =
      meta['description'] ||
      meta['og:description'] ||
      meta['twitter:description'];

    return {
      url,
      source,
      sizeOfArticle,
      sizeOfArticlePage,
      createdAt: new Date(),
      slug: utils.extractSlug(url),
      domain: utils.extractDomain(url),
      urlToImage: urlToImage || rest.lead_image_url,
      publishedAt: new Date(publishedAt || Date.now()),
      canonical: utils.extractCanonicalUrl(html) || url,
      title: title || this.extractTitleTagText(html) || url,
      articleToPageSizeRatio: sizeOfArticle / sizeOfArticlePage,
      content: he.encode(content || ''),
      author: utils.properCase(meta['author'] || rest.author || ''),
      wordCount: content ? utils.countWords(content) : rest.word_count,
      description: description || this.extractFirstParagraph(content || ''),
      tags: [],
    };
  }

  public static async extractContentFromUrl(dirtyUrl: string): Promise<string> {
    const url = utils.normalizeUrl(dirtyUrl);
    const html = utils.sanitizeHtml(await this.getWebpageHtml(url));
    const { content }: ParseResult = await Mercury.parse(url, {
      html: Buffer.from(html, 'utf-8'),
    });

    return content || '';
  }

  // gets the first paragraph of a given HTML snippet
  private static extractFirstParagraph(snippet: string): string {
    const p = JSDOM.fragment(snippet).querySelector('p');

    return p ? striptags(p.innerText || p.innerHTML) : '';
  }

  private static extractTitleTagText(html: string): string | null {
    const title = new JSDOM(html).window.document.head.querySelector('title');

    return title ? title.textContent || striptags(title.innerHTML) : null;
  }

  private static async getWebpageHtml(url: string): Promise<string> {
    return (await axios.get(url)).data;
  }

  private static removeExtra(str: string): string {
    return utils.removeExtraSpaces(utils.removeExtraLines(str));
  }
}
