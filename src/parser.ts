import axios from 'axios';
import { JSDOM } from 'jsdom';
import Mercury, { ParseResult } from '@postlight/mercury-parser';
import playwright, { Browser, BrowserContext, Page } from 'playwright';
import striptags from 'striptags';

import ArticleSource from './models/ArticleSource';
import { sanitizeHtml } from './util/sanitizer';
import * as urlUtils from './util/url';
import { countWords, properCase } from './util/words';

import * as types from './typings';

export default class Parser {
  private static browserPages = new Set<Page>();
  private static browserContexts = new Set<BrowserContext>();

  public static async initialize() {
    const browsers: Browser[] = await Promise.all([
      playwright.chromium.launch(),
      playwright.firefox.launch(),
      playwright.webkit.launch(),
    ]);

    await Promise.all(
      browsers.map(async browser => {
        const ctx = await browser.newContext();
        const newPage = await ctx.newPage();

        this.browserContexts.add(ctx);
        this.browserPages.add(newPage);
      })
    );
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

  private static async getRandomBrowserPage(): Promise<Page> {
    const random = Math.floor(Math.random() * this.browserPages.size);
    let page = [...this.browserPages][random];

    if (page) this.browserPages.delete(page);
    else page = await this.createBrowserPage();

    return page;
  }

  private static async createBrowserPage(): Promise<Page> {
    const context = this.getRandomBrowserContext();
    const [newPage] = await Promise.all([
      context.newPage(),
      context.clearCookies(),
    ]);

    this.browserPages.add(newPage);

    return newPage;
  }

  private static getRandomBrowserContext(): BrowserContext {
    const random = Math.floor(Math.random() * this.browserContexts.size);

    return [...this.browserContexts][random];
  }

  private static async getWebpageHtml(url: string): Promise<string> {
    const page = await this.getRandomBrowserPage();

    await page.goto(url);

    const [head, body] = await Promise.all([page.$('head'), page.$('body')]);
    const dirtyHtmls = await Promise.all([
      head ? head.innerHTML() : '',
      body ? body.innerHTML() : '',
    ]);

    page.close().catch(console.error);
    this.browserPages.delete(page);

    return sanitizeHtml(dirtyHtmls.join(''));
  }
}
