/**
 * Load assets.config.js
 */
import fs from 'fs';
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
  imagesDbFile?: DbFileOptions['dbFilePath'],
  soundsDbFile?: DbFileOptions['dbFilePath'],
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
    logger.debug(`Config loading: ${this.path}`);
    const fileVariants = this.getFileVariants().map(file => path.resolve(file));
    const existingFile = fileVariants.find(p => fs.existsSync(p));
    if (!existingFile) throw new Error(`File not found: ${this.path}`);
    const content = await import(existingFile);
    this.data = Object.assign({}, defaults, content.default as ConfigData);
    this.assertDuplicateTargetNames();
    logger.debug(`Config loaded: ${existingFile}`);
  }

  getTarget(name: string) {
    const target = this.data.targets.find(t => t.name === name);
    if (!target) throw new Error(`Unknown target: ${name}`);
    return target;
  }

  private getFileVariants() {
    const fileInfo = path.parse(this.path);
    // use variants if file is default value: ./deploy.config.(js|cjs)
    const useVariants = fileInfo.ext.includes('|');
    return useVariants
      ? [ '.js', '.cjs' ].map(ext => path.format({ ...fileInfo, base: '', ext }))
      : [ this.path ];
  }

  private assertDuplicateTargetNames() {
    const groups = groupBy(this.data.targets, t => t.name);
    const duplicates = Object.keys(groups).filter(key => groups[key].length > 1);
    if (duplicates.length) throw new Error(`Duplicate target names: ${duplicates.join(',')}`);
  }
}
