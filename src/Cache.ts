import util from 'util';

type CacheOptions = {
  maxSize?: number;
  ratioToDelete?: number;
};

const cacheSizeReducer = <T>(acc: number, value: T): number => {
  // we use `util.inspect` here to prevent crashing from
  // circular references in objects of type T
  const safelyStringified = util.inspect(value);
  return acc + Buffer.byteLength(safelyStringified);
};

export default class Cache<T extends { [key: string]: any }> {
  private keyValueMap = new Map<string, T>();

  public constructor(private options: CacheOptions = {}) {
    if (
      options.ratioToDelete &&
      (options.ratioToDelete >= 1 || options.ratioToDelete < 0)
    ) {
      throw new Error(
        `Cannot create cache with ratio ${options.ratioToDelete}`
      );
    }
  }

  private checkCache() {
    const { maxSize } = this.options;

    if (maxSize && this.sizeInBytes > maxSize) this.partiallyClearCache();
  }

  private get sizeInBytes(): number {
    return [...this.keyValueMap.values()].reduce(cacheSizeReducer, 0);
  }

  private partiallyClearCache() {
    const { maxSize, ratioToDelete = 1 / 10 } = this.options;
    let amountToDelete = Math.floor(maxSize! * ratioToDelete);
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

  public set(key: string, value: T): void {
    this.checkCache();
    this.keyValueMap.set(key, value);
  }

  public setAll(commonKey: string, values: T[]): void {
    this.checkCache();

    values.forEach(value => {
      this.keyValueMap.set(value[commonKey], value);
    });
  }

  public has(key: string): boolean {
    return this.keyValueMap.has(key);
  }
}
