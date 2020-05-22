import { FindOneOptions } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

import Model from './Model';
import Parser from '../Parser';
import { toUniqueArray } from '../util/fns';

import * as types from '../typings';

export default class SavedArticle extends Model<types.NewsArticleProps> {
  protected static readonly collectionName = 'saved_articles';

  private constructor(protected props: types.NewsArticleProps) {
    super(props);
  }

  private get uniqueId(): string {
    return this.props.uniqueId!;
  }

  private get url(): string {
    return this.props.url;
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
    let criteria: Partial<types.NewsArticleProps>;
    let data: types.NewsArticleProps;

    if (this.uniqueId) {
      criteria = { uniqueId: this.uniqueId };
      data = this.data;
    } else {
      criteria = { url: this.url };
      data = { ...this.data, uniqueId: uuidv4() };
    }

    await SavedArticle.collection.findOneAndReplace(criteria, data, {
      upsert: true,
    });

    return this;
  }

  public static async findOne(
    criteria: Partial<types.NewsArticleProps>
  ): Promise<SavedArticle | null> {
    const articleData: types.NewsArticleProps | null = await super.collection.findOne(
      criteria
    );

    return articleData ? new SavedArticle(articleData) : null;
  }

  public static async findAll(
    criteria: Partial<types.NewsArticleProps>,
    options: FindOneOptions = { limit: 100 }
  ): Promise<SavedArticle[]> {
    const results: types.NewsArticleProps[] = await super.collection
      .find(criteria, options)
      .toArray();

    return results.map(data => new SavedArticle(data));
  }

  public static async addNew(url: string): Promise<SavedArticle> {
    const data: types.NewsArticleProps = await Parser.extractUrlData(url);

    return new SavedArticle(data).save();
  }
}
