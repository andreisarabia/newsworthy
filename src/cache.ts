type CacheOptions = {
  maxSize: number;
};

export default class Cache<T> {
  private keyValueMap = new Map<string, T>();

  public constructor(private options: CacheOptions = { maxSize: 50 }) {}

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

    return this;
  }

  public has(key: string): boolean {
    return this.keyValueMap.has(key);
  }
}
