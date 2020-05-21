import axios from 'axios';
import { JSDOM } from 'jsdom';
import Mercury, { ParseResult } from '@postlight/mercury-parser';
import striptags from 'striptags';

import ArticleSource from './models/ArticleSource';
import * as utils from './util';

import * as types from './typings';

export default class Parser {
  public static async extractUrlData(
    dirtyUrl: string
  ): Promise<types.NewsArticleProps> {
    const url = utils.normalizeUrl(dirtyUrl);
    const html = await this.getWebpageHtml(url);
    const [parseResult, articleSrc] = await Promise.all([
      Mercury.parse(url, { html: Buffer.from(html, 'utf-8') }),
      ArticleSource.findOne({ url: new URL(url).origin }),
    ]);

    const { content = '', ...rest } = parseResult!;
    const {
      author = rest.author,
      description,
      'og:title': ogTitle,
      'og:description': ogDescription,
      'twitter:title': twitterTitle,
      'twitter:description': twitterDescription,
      'og:image': urlToImage,
      'twitter:image': twitterImage,
      'article:published_time': publishedAt,
      'article:modified_time': modifiedAt,
    } = utils.extractMetaPropertyContent(
      html,
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

    const source = articleSrc
      ? { id: articleSrc.id, name: articleSrc.name }
      : { id: '', name: '' };
    const sizeOfArticlePage = Buffer.byteLength(html);
    const sizeOfArticle = Buffer.byteLength(content!);
    const title = ogTitle || twitterTitle;

    return {
      source,
      url,
      sizeOfArticlePage,
      sizeOfArticle,
      content,
      title: title || this.extractTitleTagText(html) || rest.title || url,
      publishedAt: new Date(
        publishedAt || modifiedAt || rest.date_published || Date.now()
      ),
      urlToImage: urlToImage || twitterImage || rest.lead_image_url,
      articleToPageSizeRatio: sizeOfArticle / sizeOfArticlePage,
      wordCount: utils.countWords(content!) || rest.word_count,
      canonical: utils.extractCanonicalUrl(html) || url,
      author: utils.properCase(author || ''),
      domain: utils.extractDomain(url),
      slug: utils.extractSlug(url),
      createdAt: new Date(),
      description:
        description ||
        ogDescription ||
        twitterDescription ||
        this.extractFirstParagraph(content!),
      tags: [],
    };
  }

  public static async extractContentFromUrl(dirtyUrl: string): Promise<string> {
    const url = utils.normalizeUrl(dirtyUrl);
    const html = await this.getWebpageHtml(url);
    const { content = '' }: ParseResult = await Mercury.parse(url, {
      html: Buffer.from(html, 'utf-8'),
    });

    return content!;
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
    return utils.sanitizeHtml((await axios.get(url)).data);
  }
}
