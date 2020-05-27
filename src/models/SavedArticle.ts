import mongodb from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

import Model from './Model';
import Parser from '../Parser';
import { toUniqueArray } from '../util/fns';

import * as types from '../typings';
import cloudinary from '../services/cloudinary';

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

    return `${folder}/${filename}`;
  }

  public get content(): string | null {
    return this.props.content;
  }

  public get tags(): string[] {
    return [...this.props.tags];
  }

  public addTags(tags: string[]): this {
    this.props.tags = toUniqueArray([
      ...this.tags,
      ...tags.map(str => str.trim()),
    ]).sort();

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

  public static async addNew(url: string): Promise<SavedArticle | null> {
    try {
      const data: types.NewsArticleProps = await Parser.extractUrlData(url);

      return new SavedArticle(data).save();
    } catch (error) {
      console.error(error);

      return null;
    }
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
        ({ result } = await super.collection.deleteOne({ uniqueId }));
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
      const imageIds = (await this.findAll({}, findOpts)).flatMap(
        article => article.cloudinaryImageId || []
      );

      await Promise.all([
        this.deleteImageData(imageIds),
        super.dropCollection(),
      ]);

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }

  private static async deleteImageData(
    imageIds: string[],
    chunks: number = 20
  ): Promise<void> {
    chunks = chunks > imageIds.length ? imageIds.length : chunks;

    for (let i = 0; i < imageIds.length; i += chunks) {
      const idChunks = imageIds.slice(i, i + chunks);

      await Promise.all(idChunks.map(id => cloudinary.uploader.destroy(id)));
    }
  }
}
