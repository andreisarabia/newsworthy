import axios from 'axios';
import { FindOneOptions } from 'mongodb';

import * as db from '../../database';
import { articlesCache } from '../routes/api';
import { toUniqueArray } from '../../util/fns';
import { extractUrlData } from '../../parser';
import {
  extractCanonicalUrl,
  extractDomain,
  extractSlug,
} from '../../util/url';

import { NewsArticleProps } from '../../typings';

const collectionName = 'saved_articles';
const { log } = console;

export default class SavedArticle {
  private constructor(private props: NewsArticleProps) {}

  private get url() {
    return this.props.url;
  }

  public get tags() {
    return this.props.tags;
  }

  public get data() {
    return { ...this.props };
  }

  public addTags(tags: string[]): this {
    this.props.tags = toUniqueArray([
      ...this.tags,
      ...tags.map(str => str.trim()),
    ]).sort();

    return this;
  }

  public async save(): Promise<this> {
    await db
      .getCollection(collectionName)
      .findOneAndReplace({ url: this.url }, this.data, { upsert: true });

    return this;
  }

  public static async findOne(
    criteria: Partial<NewsArticleProps>
  ): Promise<SavedArticle | null> {
    const articleData = await db
      .getCollection(collectionName)
      .findOne(criteria);

    return articleData ? new SavedArticle(articleData) : null;
  }

  public static async findAll(
    options: FindOneOptions = { limit: 100 }
  ): Promise<SavedArticle[]> {
    const results = await db
      .getCollection(collectionName)
      .find({}, options)
      .toArray();

    return results.map(data => new SavedArticle(data));
  }

  public static saveArticles(urls: string | string[]): Promise<SavedArticle[]> {
    urls = Array.isArray(urls) ? toUniqueArray(urls) : [urls];

    return Promise.all(
      urls.map(async url => {
        const articleData = await this.parseData(url);

        return new SavedArticle(articleData).save();
      })
    );
  }

  private static async parseData(url: string): Promise<NewsArticleProps> {
    if (!articlesCache.has(url)) return extractUrlData(url);

    const savedApiArticle = articlesCache.get(url)!;
    const { data: html }: { data: string } = await axios.get(url);

    return {
      ...savedApiArticle,
      domain: extractDomain(url),
      canonicalUrl: extractCanonicalUrl(html) || url,
      slug: extractSlug(url),
      sizeInBytes: Buffer.byteLength(savedApiArticle.content || ''),
      createdAt: new Date(),
      tags: [],
    };
  }
}
