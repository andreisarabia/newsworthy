import axios from 'axios';
import { JSDOM } from 'jsdom';
import Mercury from '@postlight/mercury-parser';
import striptags from 'striptags';
import he from 'he'; // hehehe

import ArticleSource from './models/ArticleSource';
import cloudinary from './services/cloudinary';
import * as utils from './util';

import * as types from './typings';

export default class Parser {
  public static async extractUrlData(
    dirtyUrl: string
  ): Promise<types.NewsArticleProps> {
    const url = utils.normalizeUrl(dirtyUrl); // just keep origin and pathname
    const dirtyHtml = await this.getWebpageHtml(url);
    const html = utils.sanitizeHtml(dirtyHtml);
    const meta = utils.extractMetaContent(
      dirtyHtml, // extract dirty html here because sanitization removes some properties
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
    const domain = utils.extractDomain(url);
    const folder = domain;
    const slug = utils.extractSlug(url);
    const filename = `${slug}-${Date.now()}`;

    let urlToImage: string | null =
      meta['og:image'] || meta['twitter:image'] || null;

    const [imageUrl, parseResult, articleSrc] = await Promise.all([
      this.uploadToCloudinary({ url: urlToImage, folder, filename }),
      Mercury.parse(url, { html: Buffer.from(html) }),
      ArticleSource.findOne({ url: new URL(url).origin }),
    ]);

    if (imageUrl) urlToImage = imageUrl;

    const { content, lead_image_url, ...rest } = parseResult!;

    if (!urlToImage && lead_image_url)
      urlToImage = await this.uploadToCloudinary({
        url: lead_image_url,
        folder,
        filename,
      });

    const sizeOfArticlePage = Buffer.byteLength(html);
    const sizeOfArticle = Buffer.byteLength(content || '');

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
      meta['twitter:description'] ||
      this.extractFirstParagraph(content || '');
    const title =
      meta['og:title'] ||
      meta['twitter:title'] ||
      rest.title ||
      this.extractTitleTagText(html) ||
      url;
    const author = meta['author'] || rest.author || '';

    return Object.freeze({
      url,
      slug,
      title,
      domain,
      source,
      urlToImage,
      description,
      sizeOfArticle,
      sizeOfArticlePage,
      createdAt: utils.isoTimestamp(),
      content: he.encode(content || ''),
      author: utils.properCase(author),
      publishedAt: new Date(publishedAt || Date.now()).toISOString(),
      canonical: utils.extractCanonicalUrl(html) || url,
      articleToPageSizeRatio: sizeOfArticle / sizeOfArticlePage,
      wordCount: content ? utils.countWords(content) : rest.word_count,
      tags: [],
    });
  }

  public static async extractContentFromUrl(
    dirtyUrl: string
  ): Promise<string | null> {
    const url = utils.normalizeUrl(dirtyUrl);
    const html = utils.sanitizeHtml(await this.getWebpageHtml(url));
    const parsed: Mercury.ParseResult = await Mercury.parse(url, {
      html: Buffer.from(html, 'utf-8'),
    });

    return parsed.content;
  }

  private static extractFirstParagraph(snippet: string): string {
    const p = JSDOM.fragment(snippet).querySelector('p');

    return p ? p.textContent || striptags(p.innerHTML) : '';
  }

  private static extractTitleTagText(html: string): string | null {
    const title = JSDOM.fragment(html).querySelector('title');

    return title ? title.textContent || striptags(title.innerHTML) : null;
  }

  private static async getWebpageHtml(url: string): Promise<string> {
    return (await axios.get(url)).data;
  }

  private static async uploadToCloudinary({
    url,
    folder,
    filename,
  }: {
    url: string | null;
    folder: string;
    filename?: string;
  }): Promise<string | null> {
    if (url === null) return null;

    try {
      const options = { public_id: filename, folder };
      const response = await cloudinary.uploader.upload(url, options);

      return response.secure_url;
    } catch (error) {
      console.error(error);

      return null;
    }
  }
}
