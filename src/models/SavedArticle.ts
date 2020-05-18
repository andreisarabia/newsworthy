import axios from 'axios';
import { FindOneOptions } from 'mongodb';

import * as db from '../database';
import { articlesCache } from '../routes/api';
import { toUniqueArray } from '../util/fns';
import { normalizeUrl } from '../util/url';
import { extractUrlData } from '../parser';
import { extractCanonicalUrl, extractDomain, extractSlug } from '../util/url';

import * as types from '../typings';

const collectionName = 'saved_articles';
const { log } = console;

export default class SavedArticle {
  private constructor(private props: types.NewsArticleProps) {}

  private get url() {
    return this.props.url;
  }

  public get tags() {
    return this.props.tags;
  }

  public get data() {
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
    await db
      .getCollection(collectionName)
      .findOneAndReplace({ url: this.url }, this.data, { upsert: true });

    return this;
  }

  public static async findOne(
    criteria: Partial<types.NewsArticleProps>
  ): Promise<SavedArticle | null> {
    const articleData = await db
      .getCollection(collectionName)
      .findOne(criteria);

    return articleData ? new SavedArticle(articleData) : null;
  }

  public static async findAll(
    criteria: Partial<types.NewsArticleProps>,
    options: FindOneOptions = { limit: 100 }
  ): Promise<SavedArticle[]> {
    const results = await db
      .getCollection(collectionName)
      .find(criteria, options)
      .toArray();

    return results.map(data => new SavedArticle(data));
  }

  public static async addNew(url: string): Promise<SavedArticle> {
    url = normalizeUrl(url);

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
      data = await extractUrlData(url);
    }

    return new SavedArticle(data).save();
  }

  public static async dropCollection() {
    try {
      await db.getCollection(collectionName).drop();

      return true;
    } catch {
      return false;
    }
  }
}
