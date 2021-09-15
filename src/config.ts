/**
 * Load assets.config.js
 */
import path from 'path';
import { LocalAssetsConfig } from './local-assets';
import { AliceApiOptions } from './alice/base';
import { MarusyaApiOptions } from './marusya/base';
import { DbFileOptions } from './db-file';
import { logger } from './logger';
import { Platform } from './types';

export type AliceTarget = AliceApiOptions & Pick<DbFileOptions, 'dbFile'> & {
  platform: Platform.alice;
}

export type MarusyaTarget = MarusyaApiOptions & Pick<DbFileOptions, 'dbFile'> & {
  platform: Platform.marusya;
}

export type Target = AliceTarget | MarusyaTarget;

export interface ConfigData {
  images?: LocalAssetsConfig,
  sounds?: LocalAssetsConfig,
  targets: Record<string, Target>,
  timeout?: number;
}

const defaults: Partial<ConfigData> = {
  timeout: 5000,
};

export class Config {
  data!: ConfigData;

  constructor(private path: string) { }

  async load() {
    // todo: find file js, cjs, mjs
    logger.debug(`Loading config from: ${this.path}`);
    const fullPath = path.join(process.cwd(), this.path);
    const content = await import(fullPath);
    this.data = Object.assign({}, defaults, content.default as ConfigData);
    logger.debug(`Config loaded.`);
  }

  getTarget(name: string) {
    const target = this.data.targets[name];
    if (!target) throw new Error(`Unknown target: ${name}`);
    return target;
  }
}
