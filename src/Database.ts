import { MongoClient, Collection } from 'mongodb';

import Cache from './Cache';
import Config from './config';

// we cache collections with a key-value map, so getting a
// collection only takes collectionName -> collection,
// instead of collectionName -> client -> db() -> collection
export default class Database {
  private static cache = new Cache<Collection, 'collectionName'>();
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

    const collection = collectionName as 'collectionName';

    if (!this.cache.has(collection))
      this.cache.set(collection, this.client.db().collection(collection));

    return this.cache.get(collection)!;
  }
}
