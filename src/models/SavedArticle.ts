import axios from 'axios';
import { FindOneOptions } from 'mongodb';

import Database from '../database';
import Parser from '../parser';
import { articlesCache } from '../routes/api';
import { toUniqueArray } from '../util/fns';
import { normalizeUrl } from '../util/url';
import { extractCanonicalUrl, extractDomain, extractSlug } from '../util/url';

import * as types from '../typings';

const collectionName = 'saved_articles';

export default class SavedArticle {
  private constructor(private props: types.NewsArticleProps) {}

  private get url() {
    return this.props.url;
  }

  public get tags() {
    return this.props.tags;
  }

  public get data(): Omit<types.NewsArticleProps, '_id'> {
    const { _id, ...publicData } = this.props;

    return Object.freeze(publicData);
  }

  public addTags(tags: string[]): this {
    this.props.tags = toUniqueArray([
      ...this.props.tags,
      ...tags.map(str => str.trim()),
    ]).sort();

    return this;
  }

  public async save(): Promise<this> {
    await Database.getCollection(collectionName).findOneAndReplace(
      { url: this.url },
      this.data,
      { upsert: true }
    );

    return this;
  }

  public static async findOne(
    criteria: Partial<types.NewsArticleProps>
  ): Promise<SavedArticle | null> {
    const articleData = await Database.getCollection(collectionName).findOne(
      criteria
    );

    return articleData ? new SavedArticle(articleData) : null;
  }

  public static async findAll(
    criteria: Partial<types.NewsArticleProps>,
    options: FindOneOptions = { limit: 100 }
  ): Promise<SavedArticle[]> {
    const results = await Database.getCollection(collectionName)
      .find(criteria, options)
      .toArray();

    return results.map(data => new SavedArticle(data));
  }

  public static async addNew(dirtyUrl: string): Promise<SavedArticle> {
    const url = normalizeUrl(dirtyUrl);

    let data: types.NewsArticleProps;

    if (articlesCache.has(url)) {
      const savedApiArticle = articlesCache.get(url)!;
      const { data: html }: { data: string } = await axios.get(url);

      data = {
        ...savedApiArticle,
        domain: extractDomain(url),
        canonicalUrl: extractCanonicalUrl(html) || url,
        slug: extractSlug(url),
        sizeInBytes: Buffer.byteLength(savedApiArticle.content || ''),
        createdAt: new Date(),
        tags: [],
      };
    } else {
      data = await Parser.extractUrlData(url);
    }

    return new SavedArticle(data).save();
  }

  public static async dropCollection() {
    try {
      await Database.getCollection(collectionName).drop();

      return true;
    } catch {
      return false;
    }
  }
}
