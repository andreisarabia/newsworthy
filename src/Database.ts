import { MongoClient, Collection } from 'mongodb';

import Config from './config';

// we cache collections with a key-value map, so getting a
// collection only takes collectionName -> collection,
// instead of collectionName -> client -> db() -> collection
export default class Database {
  private static cache = new Map<string, Collection>();
  private static client: MongoClient;

  public static async initialize(): Promise<void> {
    if (this.client !== undefined) return;

    const mongoUri = Config.get('mongoUri') || 'mongodb://localhost';
    const clientOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: 20,
    };

    this.client = await MongoClient.connect(mongoUri, clientOptions);
  }

  public static getCollection(collectionName: string): Collection<any> {
    if (this.client === undefined)
      throw new Error('Instantiate the database client before using it!');

    let collection = this.cache.get(collectionName);

    if (!collection) {
      collection = this.client.db().collection(collectionName);
      this.cache.set(collectionName, collection);
    }

    return collection;
  }
}
