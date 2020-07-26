type CacheOptions = {
  clearInterval?: number; // in minutes
};

export default class Cache<
  T extends { [key: string]: any },
  K extends keyof T
> {
  private keyValueMap = new Map<K, T>();

  public constructor(options: Partial<CacheOptions> = {}) {
    const { clearInterval } = options;

    if (clearInterval) {
      const ms = 1000 * 60 * clearInterval;

      setInterval(() => this.keyValueMap.clear(), ms);
    }
  }

  public get isEmpty(): boolean {
    return this.keyValueMap.size === 0;
  }

  public get(key: K): T | undefined {
    return this.keyValueMap.get(key);
  }

  public set(key: K, value: T): void {
    this.keyValueMap.set(key, value);
  }

  public getAll(): T[] {
    return [...this.keyValueMap.values()];
  }

  public setAll(commonKey: K, values: T[]): void {
    values.forEach(value => {
      this.keyValueMap.set(value[commonKey], value);
    });
  }

  public has(key: K): boolean {
    return this.keyValueMap.has(key);
  }
}
