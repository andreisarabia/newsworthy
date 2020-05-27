import { FindOneOptions } from 'mongodb';

import Model from './Model';

import * as types from '../typings';

export default class ArticleSource extends Model<types.ArticleSourceProps> {
  protected static readonly collectionName = 'article_sources';

  private constructor(props: types.ArticleSourceProps) {
    super(props);
    this.props.name = this.props.name || new URL(this.props.url).hostname;
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

  public async save(): Promise<this> {
    const searchFilter = { url: this.url };
    const replacement = this.data;
    const options = { upsert: true };

    await ArticleSource.collection.findOneAndReplace(
      searchFilter,
      replacement,
      options
    );

    return this;
  }

  public static async findOne(
    criteria: Partial<types.ArticleSourceProps>
  ): Promise<ArticleSource | null> {
    const sourcesData = await super.collection.findOne(criteria);

    return sourcesData ? new ArticleSource(sourcesData) : null;
  }

  public static async findAll(
    criteria: Partial<types.ArticleSourceProps> = {},
    options?: FindOneOptions
  ): Promise<ArticleSource[]> {
    const results = await super.collection.find(criteria, options).toArray();

    return results.map(data => new ArticleSource(data));
  }

  public static saveAll(
    sources: types.ArticleSourceProps[]
  ): Promise<ArticleSource[]> {
    return Promise.all(sources.map(source => new ArticleSource(source).save()));
  }
}
