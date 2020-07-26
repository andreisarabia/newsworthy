import mongodb from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

import Model from './Model';
import Parser from '../Parser';
import cloudinary from '../services/cloudinary';
import * as utils from '../util';

import * as types from '../typings';

/**
 * Represents a parsed article and its associated meta-content (tags, description, main image, etc.)
 */
export default class SavedArticle extends Model<types.NewsArticleProps> {
  protected static readonly collectionName = 'saved_articles';

  private constructor(props: types.NewsArticleProps) {
    super(props);
  }

  private get uniqueId(): string | undefined {
    return this.props.uniqueId;
  }

  private set uniqueId(value: string | undefined) {
    this.props.uniqueId = value;
  }

  private get url(): string {
    return this.props.url;
  }

  private get urlToImage(): string | null | undefined {
    return this.props.urlToImage;
  }

  private get domain(): string {
    return this.props.domain;
  }

  private get cloudinaryImageId(): string | null {
    const url = this.urlToImage;

    if (!url) return null;

    const folder = this.domain;
    const lastFwdSlashIdx = url.lastIndexOf('/') + 1;
    const lastPeriodIdx = url.lastIndexOf('.');
    const filename =
      lastPeriodIdx > lastFwdSlashIdx
        ? url.slice(lastFwdSlashIdx, lastPeriodIdx)
        : url.slice(lastFwdSlashIdx);

    return `${folder}/${filename}`; // e.g. vox/facebook-news-feed-political-ads-2020-election
  }

  public get content(): string | null {
    return this.props.content;
  }

  public get tags(): string[] {
    return [...this.props.tags];
  }

  public addTags(tags: string[]): this {
    tags = tags.map(str => str.trim());
    this.props.tags = utils.toUniqueArray([...this.tags, ...tags]).sort();
    return this;
  }

  public async save(): Promise<this> {
    this.uniqueId = this.uniqueId || uuidv4();

    const searchFilter = { url: this.url };
    const replacement = this.data;
    const options = { upsert: true };

    await SavedArticle.collection.findOneAndReplace(
      searchFilter,
      replacement,
      options
    );

    return this;
  }

  public static async addNew(url: string): Promise<SavedArticle | null> {
    try {
      const data: types.NewsArticleProps = await Parser.extractUrlData(url);

      return new SavedArticle(data).save();
    } catch (error) {
      console.error(error);

      return null;
    }
  }

  public static async findOne(
    criteria: Partial<types.NewsArticleProps>,
    options?: mongodb.FindOneOptions
  ): Promise<SavedArticle | null> {
    const resultData = await super.collection.findOne(criteria, options);

    return resultData ? new SavedArticle(resultData) : null;
  }

  public static async findAll(
    criteria: Partial<types.NewsArticleProps> = {},
    options: mongodb.FindOneOptions = { limit: 100 }
  ): Promise<SavedArticle[]> {
    const results = await super.collection.find(criteria, options).toArray();

    return results.map(resultData => new SavedArticle(resultData));
  }

  public static async delete(uniqueId: string): Promise<boolean> {
    try {
      const options = { projection: { domain: 1, urlToImage: 1 } };
      const article = await this.findOne({ uniqueId }, options);

      if (!article) return false;

      let result: { ok?: number }; // 1 if correctly executed, 0 otherwise

      if (article.cloudinaryImageId) {
        [, { result }] = await Promise.all([
          cloudinary.uploader.destroy(article.cloudinaryImageId),
          super.collection.deleteOne({ uniqueId }),
        ]);
      } else {
        result = (await super.collection.deleteOne({ uniqueId })).result;
      }

      return result.ok === 1;
    } catch (error) {
      console.error(error);

      return false;
    }
  }

 
  public static async dropCollection(): Promise<boolean> {
    try {
      const findOpts = { limit: 0, projection: { domain: 1, urlToImage: 1 } };
      // flat map here to prevent looping twice to get rid of `null` image ids
      const imageIds = (await this.findAll({}, findOpts)).flatMap(
        article => article.cloudinaryImageId || []
      );

      await Promise.all([
        utils.parallelize(imageIds, 20, id => cloudinary.uploader.destroy(id)),
        super.dropCollection(),
      ]);

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }
}
