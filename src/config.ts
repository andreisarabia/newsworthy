import fs from 'fs';

type ConfigFile = {
  newsApiKey: string;
  mongoUri: string;
  port?: number;
  env: string;
};

export default class Config {
  private static readonly settings: ConfigFile = {
    ...JSON.parse(fs.readFileSync('config.json', 'utf-8')),
    env: process.env.NODE_ENV !== 'production' ? 'dev' : 'prod',
  };

  public static get<K extends keyof ConfigFile>(key: K): ConfigFile[K] {
    switch (key) {
      case 'port':
        return this.settings[key] || (3000 as ConfigFile[K]);
      default:
        return this.settings[key];
    }
  }

  public static getAll<K extends keyof ConfigFile>(
    ...keys: K[]
  ): Partial<{ [key in K]: ConfigFile[K] }> {
    const keyMap: Partial<{ [key in K]: ConfigFile[K] }> = {};

    keys.forEach(key => {
      keyMap[key] = this.settings[key];
    });

    return keyMap;
  }
}
