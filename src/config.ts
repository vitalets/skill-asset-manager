/**
 * Load assets.config.js
 */
import path from 'path';
import { LocalAssetsConfig } from './local-assets';
import { AliceApiOptions } from './api/alice/base';
import { MarusyaApiOptions } from './api/marusya/base';
import { DbFileOptions } from './db-file';
import { logger } from './utils/logger';
import { Platform } from './types';
import { groupBy } from './utils';

interface BaseTarget {
  platform: Platform,
  name: string,
  dbFile: DbFileOptions['dbFile'],
}

export type AliceTarget = BaseTarget & AliceApiOptions & { platform: Platform.alice }
export type MarusyaTarget = BaseTarget & MarusyaApiOptions & { platform: Platform.marusya }
export type Target = AliceTarget | MarusyaTarget;

export interface ConfigData {
  images?: LocalAssetsConfig,
  sounds?: LocalAssetsConfig,
  timeout?: number;
  targets: Target[],
}

const defaults: Partial<ConfigData> = {
  timeout: 5000,
};

export class Config {
  data!: ConfigData;

  constructor(private path: string) { }

  async load() {
    // todo: find file js, cjs, mjs
    logger.debug(`Config loading: ${this.path}`);
    const fullPath = path.join(process.cwd(), this.path);
    const content = await import(fullPath);
    this.data = Object.assign({}, defaults, content.default as ConfigData);
    this.assertDuplicateTargetNames();
    logger.debug(`Config loaded.`);
  }

  getTarget(name: string) {
    const target = this.data.targets.find(t => t.name === name);
    if (!target) throw new Error(`Unknown target: ${name}`);
    return target;
  }

  private assertDuplicateTargetNames() {
    const groups = groupBy(this.data.targets, t => t.name);
    const duplicates = Object.keys(groups).filter(key => groups[key].length > 1);
    if (duplicates.length) throw new Error(`Duplicate target names: ${duplicates.join(',')}`);
  }
}
