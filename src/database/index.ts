import { MongoClient, Collection } from 'mongodb';

import Cache from '../cache';
import Config from '../config';

// using a key-value cache directly references
// a collection with a string, instead of [0]
const cache = new Cache<Collection>();

let client: MongoClient | null = null;

export const initialize = async () => {
  if (client === null) {
    const mongoUri = Config.get('mongoUri');
    const clientOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: 20,
    };

    client = await MongoClient.connect(mongoUri, clientOptions);
  }
};

export const getCollection = (collectionName: string): Collection => {
  let collection = cache.get(collectionName);

  if (!collection) {
    collection = (<MongoClient>client).db().collection(collectionName); // [0]
    cache.set(collectionName, collection);
  }

  return collection;
};
