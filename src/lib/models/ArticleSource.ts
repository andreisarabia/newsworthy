import { FindOneOptions } from 'mongodb';

import * as db from '../../database';

import { ArticleSourceProps } from '../../typings';

const collectionName = 'article_sources';

export default class ArticleSource {
  private constructor(private props: ArticleSourceProps) {}

  private get data() {
    return { ...this.props };
  }

  private get url() {
    return this.props.url;
  }

  public get id() {
    return this.props.id;
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
    criteria: Partial<ArticleSourceProps>
  ): Promise<ArticleSource | null> {
    const sourcesData = await db
      .getCollection(collectionName)
      .findOne(criteria);

    return sourcesData ? new ArticleSource(sourcesData) : null;
  }

  public static async findAll(
    options?: FindOneOptions
  ): Promise<ArticleSource[]> {
    const results = await db
      .getCollection(collectionName)
      .find({}, options)
      .toArray();

    return results.map(data => new ArticleSource(data));
  }

  public static saveSources(
    sources: ArticleSourceProps[]
  ): Promise<ArticleSource[]> {
    return Promise.all(sources.map(source => new ArticleSource(source).save()));
  }
}
