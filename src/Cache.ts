import util from 'util';

type CacheOptions<L, P extends keyof L> = {
  ratioToDelete: number;
  maxSize?: number;
  clearInterval?: number;
  onClear?: (cacheMap: Map<P, L>) => Promise<any>;
};

const cacheSizeReducer = <T>(acc: number, value: T): number => {
  // we use `util.inspect` here to prevent crashing from
  // circular references in objects of type T
  const safelyStringified = util.inspect(value);
  return acc + Buffer.byteLength(safelyStringified);
};

export default class Cache<
  T extends { [key: string]: any },
  K extends keyof T
> {
  private keyValueMap = new Map<K, T>();
  private options: CacheOptions<T, K>;

  public constructor(options: Partial<CacheOptions<T, K>> = {}) {
    const {
      clearInterval,
      ratioToDelete = 1 / 10,
      onClear = () => Promise.resolve(),
    } = options;

    if (ratioToDelete && (ratioToDelete >= 1 || ratioToDelete < 0)) {
      throw new Error(
        `Cannot create cache with ratio ${options.ratioToDelete}`
      );
    }

    if (clearInterval) {
      setInterval(() => {
        if (this.isEmpty) return;

        this.keyValueMap.clear();
        onClear(this.keyValueMap);
      }, clearInterval);
    }

    this.options = { ratioToDelete, clearInterval, onClear };
  }

  private checkCache() {
    const { maxSize } = this.options;

    if (maxSize && this.sizeInBytes > maxSize) this.partiallyClearCache();
  }

  private get sizeInBytes(): number {
    return this.getAll().reduce(cacheSizeReducer, 0);
  }

  private partiallyClearCache() {
    const { maxSize, ratioToDelete } = this.options;
    let amountToDelete = Math.floor(maxSize! * ratioToDelete);
    let counter = 0;

    for (const key of this.keyValueMap.keys()) {
      this.keyValueMap.delete(key);
      if (counter === amountToDelete) break;
      else counter += 1;
    }
  }

  public get isEmpty(): boolean {
    return this.keyValueMap.size === 0;
  }

  public get(key: K): T | undefined {
    return this.keyValueMap.get(key);
  }

  public set(key: K, value: T): void {
    this.checkCache();
    this.keyValueMap.set(key, value);
  }

  public getAll(): T[] {
    return [...this.keyValueMap.values()];
  }

  public setAll(commonKey: K, values: T[]): void {
    this.checkCache();

    values.forEach(value => {
      this.keyValueMap.set(value[commonKey], value);
    });
  }

  public has(key: K): boolean {
    return this.keyValueMap.has(key);
  }
}
