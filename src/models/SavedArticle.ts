import axios from 'axios';
import { FindOneOptions } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

import Model from './Model';
import Parser from '../parser';
import { articlesCache } from '../routes/api';
import { toUniqueArray } from '../util/fns';
import { normalizeUrl } from '../util/url';
import { extractCanonicalUrl, extractDomain, extractSlug } from '../util/url';

import * as types from '../typings';

export default class SavedArticle extends Model<types.NewsArticleProps> {
  protected static readonly collectionName = 'saved_articles';

  private constructor(protected props: types.NewsArticleProps) {
    super(props);
  }

  private get uniqueId() {
    return this.props.uniqueId;
  }

  private get url() {
    return this.props.url;
  }

  public get tags() {
    return this.props.tags;
  }

  public addTags(tags: string[]): this {
    this.props.tags = toUniqueArray([
      ...this.props.tags,
      ...tags.map(str => str.trim()),
    ]).sort();

    return this;
  }

  public async save(): Promise<this> {
    let criteria: Partial<types.NewsArticleProps>;
    let data: types.NewsArticleProps;

    if (this.uniqueId) {
      criteria = { uniqueId: this.uniqueId };
      data = this.props;
    } else {
      criteria = { url: this.url };
      data = { ...this.props, uniqueId: uuidv4() };
    }

    await Model.collection.findOneAndReplace(criteria, data, {
      upsert: true,
    });

    return this;
  }

  public static async findOne(
    criteria: Partial<types.NewsArticleProps>
  ): Promise<SavedArticle | null> {
    const articleData = await super.collection.findOne(criteria);

    return articleData ? new SavedArticle(articleData) : null;
  }

  public static async findAll(
    criteria: Partial<types.NewsArticleProps>,
    options: FindOneOptions = { limit: 100 }
  ): Promise<SavedArticle[]> {
    const results = await super.collection.find(criteria, options).toArray();

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
      await super.collection.drop();

      return true;
    } catch {
      return false;
    }
  }
}
