import * as util from 'util';

type CacheOptions = {
  maxSize: number;
};

export default class Cache<T extends { [key: string]: any }> {
  private keyValueMap = new Map<string, T>();

  public constructor(private options: CacheOptions) {}

  private checkCache() {
    if (this.sizeInBytes > this.options.maxSize) this.partiallyClearCache();
  }

  private get sizeInBytes(): number {
    return [...this.keyValueMap.values()].reduce(
      (acc: number, value: T): number => {
        const safelyStringified = util.inspect(value);

        return acc + Buffer.byteLength(safelyStringified);
      },
      0
    );
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
