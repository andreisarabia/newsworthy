import { Collection } from 'mongodb';

import Database from '../Database';

import * as types from '../typings';

export default abstract class Model<T extends types.MongoModelProps> {
  protected static readonly collectionName: string;
  protected props: T;

  protected constructor(props: T) {
    this.props = { ...props };
  }

  abstract async save(): Promise<this>;

  public get data(): Readonly<Omit<T, '_id'>> {
    const { _id, ...publicData } = this.props;

    return Object.freeze(publicData);
  }

  public static async dropCollection(): Promise<boolean> {
    try {
      await this.collection.drop();

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }

  public static get collection(): Collection<any> {
    return Database.getCollection(this.collectionName);
  }
}
