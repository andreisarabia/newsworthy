import axios from 'axios';
import { JSDOM } from 'jsdom';
import Mercury, { ParseResult } from '@postlight/mercury-parser';
import playwright, { Browser } from 'playwright';
import striptags from 'striptags';

import ArticleSource from './models/ArticleSource';
import { sanitizeHtml } from './util/sanitizer';
import * as urlUtils from './util/url';
import { countWords, properCase } from './util/words';

import * as types from './typings';

export default class Parser {
  private static browserSet = new Set<Browser>();

  public static async initialize() {
    const browsers: Browser[] = await Promise.all([
      playwright.chromium.launch(),
      playwright.firefox.launch(),
      playwright.webkit.launch(),
    ]);

    browsers.forEach(browser => {
      this.browserSet.add(browser);
    });
  }

  public static async extractUrlData(
    dirtyUrl: string
  ): Promise<types.NewsArticleProps> {
    const url = urlUtils.normalizeUrl(dirtyUrl);
    const html = await this.getWebpageHtml(url);

    const [parseResult, articleSrc] = await Promise.all([
      Mercury.parse(url, { html: Buffer.from(html, 'utf-8') }),
      ArticleSource.findOne({ url: new URL(url).origin }),
    ]);

    const { content, ...rest } = parseResult!;
    const source = articleSrc
      ? { id: articleSrc.id, name: articleSrc.name }
      : { id: '', name: '' };

    const publishedAt =
      urlUtils.extractPublishedTime(html) ||
      new Date(rest.date_published || Date.now());

    const sizeOfArticlePage = Buffer.byteLength(html);
    const sizeOfArticle = Buffer.byteLength(content || '');

    return {
      source,
      content,
      publishedAt,
      url,
      sizeOfArticlePage,
      sizeOfArticle,
      articleToPageSizeRatio: sizeOfArticle / sizeOfArticlePage,
      description: rest.excerpt || this.extractDescription(content || ''),
      wordCount: rest.word_count || (content ? countWords(content) : 0),
      author: properCase(urlUtils.extractAuthor(html) || rest.author || ''),
      title: urlUtils.extractTitle(html) || rest.title || url,
      domain: urlUtils.extractDomain(url),
      urlToImage: rest.lead_image_url,
      canonicalUrl: urlUtils.extractCanonicalUrl(html) || url,
      slug: urlUtils.extractSlug(url),
      createdAt: new Date(),
      tags: [],
    };
  }

  public static async extractContentFromUrl(dirtyUrl: string) {
    const url = urlUtils.normalizeUrl(dirtyUrl);
    const { data: dirtyHtml }: { data: string } = await axios.get(url);
    const html = sanitizeHtml(dirtyHtml);
    const parsed: ParseResult = await Mercury.parse(url, {
      html: Buffer.from(html, 'utf-8'),
    });

    return parsed.content || '';
  }

  // gets the first paragraph of a given HTML snippet
  private static extractDescription(html: string): string {
    const p = JSDOM.fragment(html).querySelector('p');

    return p ? p.innerText || striptags(p.innerHTML) : '';
  }

  private static getRandomBrowser(): Browser {
    const random = Math.floor(Math.random() * this.browserSet.size);

    return [...this.browserSet][random];
  }

  private static async getWebpageHtml(url: string): Promise<string> {
    const context = await this.getRandomBrowser().newContext();
    const page = await context.newPage();

    await page.goto(url);

    const [head, body] = await Promise.all([page.$('head'), page.$('body')]);
    const dirtyHtmls = await Promise.all([
      head ? head.innerHTML() : '',
      body ? body.innerHTML() : '',
    ]);

    Promise.all([context.clearCookies(), page.close()]);

    return sanitizeHtml(dirtyHtmls.join(''));
  }
}
