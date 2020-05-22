type CacheOptions = {
  maxSize: number;
};

export default class Cache<T extends { [key: string]: any }> {
  private keyValueMap = new Map<string, T>();
  private lastAddedToCache: Date = new Date();

  public constructor(private options: CacheOptions = { maxSize: 50 }) {}

  private updateLastAddedToCache() {
    this.lastAddedToCache = new Date();
  }

  private checkCache() {
    if (this.keyValueMap.size > this.options.maxSize)
      this.partiallyClearCache();
  }

  private partiallyClearCache() {
    let amountToDelete = Math.floor(this.options.maxSize / 10);
    let counter = 0;

    for (const key of this.keyValueMap.keys()) {
      this.keyValueMap.delete(key);
      if (counter === amountToDelete) break;
      else counter += 1;
    }
  }

  public get(key: string): T | undefined {
    return this.keyValueMap.get(key);
  }

  public set(key: string, value: T): this {
    this.checkCache();
    this.keyValueMap.set(key, value);
    this.updateLastAddedToCache();

    return this;
  }

  public setAll(commonKey: string, values: T[]) {
    this.checkCache();

    values.forEach(value => {
      this.keyValueMap.set(value[commonKey], value);
    });

    this.updateLastAddedToCache();
  }

  public has(key: string): boolean {
    return this.keyValueMap.has(key);
  }
}
