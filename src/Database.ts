import { MongoClient, Collection } from 'mongodb';

import Cache from './Cache';
import Config from './Config';

export default class Database {
  private static cache = new Cache<Collection>();
  private static client: MongoClient | null = null;

  public static async initialize(): Promise<void> {
    if (this.client !== null) return;

    const mongoUri = Config.get('mongoUri');
    const clientOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: 20,
    };

    this.client = await MongoClient.connect(mongoUri, clientOptions);
  }

  public static getCollection(collection: string): Collection<any> {
    if (this.client === null)
      throw new Error('Instantiate the database client before using it!');

    if (!this.cache.has(collection))
      this.cache.set(collection, this.client!.db().collection(collection));

    return this.cache.get(collection)!;
  }
}
