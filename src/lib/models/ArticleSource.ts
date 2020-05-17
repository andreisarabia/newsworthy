import { FindOneOptions } from 'mongodb';

import * as db from '../../database';

import * as types from '../../typings';

const collectionName = 'article_sources';

export default class ArticleSource {
  private constructor(private props: types.ArticleSourceProps) {}

  private get url() {
    return this.props.url;
  }

  public get id() {
    return this.props.id;
  }

  public get data() {
    const { _id, ...publicData } = this.props;

    return Object.freeze(publicData);
  }

  public get name() {
    return this.props.name;
  }

  private async save(): Promise<this> {
    await db
      .getCollection(collectionName)
      .findOneAndReplace({ url: this.url }, this.data, { upsert: true });

    return this;
  }

  public static async findOne(
    criteria: Partial<types.ArticleSourceProps>
  ): Promise<ArticleSource | null> {
    const sourcesData = await db
      .getCollection(collectionName)
      .findOne(criteria);

    return sourcesData ? new ArticleSource(sourcesData) : null;
  }

  public static async findAll(
    criteria: Partial<types.ArticleSourceProps> = {},
    options?: FindOneOptions
  ): Promise<ArticleSource[]> {
    const results = await db
      .getCollection(collectionName)
      .find(criteria, options)
      .toArray();

    return results.map(data => new ArticleSource(data));
  }

  public static saveAll(
    sources: types.ArticleSourceProps[]
  ): Promise<ArticleSource[]> {
    return Promise.all(sources.map(source => new ArticleSource(source).save()));
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
