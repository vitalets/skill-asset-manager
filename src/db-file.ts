/**
 * File storing actual info about assets for particular skill.
 */
import fs from 'fs';
import { logger } from './logger';
import { FileId, FileInfo } from './local-assets';
import { RemoteAsset } from './remote-assets';
import { AssetType } from './types';

export interface DbFileOptions {
  dbFile: string;
  assetType: AssetType;
}

export interface DbFileData {
  images: Record<FileId, RemoteAsset['payload']>;
  sounds: Record<FileId, RemoteAsset['payload']>;
  imagesMeta: Record<FileId, Meta>;
  soundsMeta: Record<FileId, Meta>;
}

export type Meta = FileInfo & { id: RemoteAsset['id'] };

export class DbFile {
  data: DbFileData = { images: {}, sounds: {}, imagesMeta: {}, soundsMeta: {} };

  constructor(private options: DbFileOptions) { }

  get payloads() {
    return this.data[this.options.assetType];
  }

  get meta() {
    return this.data[`${this.options.assetType}Meta`];
  }

  async load() {
    const { dbFile } = this.options;
    logger.debug(`Db file loading: ${dbFile}`);
    if (fs.existsSync(dbFile)) {
      const content = await fs.promises.readFile(dbFile, 'utf8');
      Object.assign(this.data, JSON.parse(content));
      logger.debug(`Db file loaded.`);
    } else {
      logger.debug(`Db file doesn't exist (${dbFile}), using fresh data.`);
    }
  }
}
