import configJSON from './config.json';

type ConfigFile = {
  newsApiKey: string;
  mongoUri?: string;
  port?: number;
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;
  env: 'dev' | 'prod';
};

export default class Config {
  private static readonly settings: ConfigFile = {
    ...configJSON,
    env: process.env.NODE_ENV !== 'production' ? 'dev' : 'prod',
  };

  public static get<K extends keyof ConfigFile>(key: K): ConfigFile[K] {
    return this.settings[key];
  }

  public static getAll<K extends keyof ConfigFile>(
    ...keys: K[]
  ): Partial<{ [key in K]: ConfigFile[K] }> {
    const keyMap: Partial<{ [key in K]: ConfigFile[K] }> = {};

    keys.forEach(key => {
      const value = this.settings[key];

      if (value) keyMap[key] = value;
    });

    return keyMap;
  }

  public static get hasCloudflareCredentials(): boolean {
    const {
      cloudinaryCloudName,
      cloudinaryApiKey,
      cloudinaryApiSecret,
    } = this.getAll(
      'cloudinaryCloudName',
      'cloudinaryApiKey',
      'cloudinaryApiSecret'
    );

    return Boolean(
      cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret
    );
  }
}
