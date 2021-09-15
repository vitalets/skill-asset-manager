/**
 * File storing actual info about assets for particular skill.
 */
import fs from 'fs';
import { logger } from './logger';
import { LocalAsset } from './local-assets';
import { RemoteAsset } from './remote-assets';
import { AssetType } from './types';
import { compareArrays } from './utils';

export interface DbFileOptions {
  dbFile: string;
  assetType: AssetType;
}

export interface DbFileData {
  images: Record<LocalAsset['fileId'], RemoteAsset['payload']>;
  sounds: Record<LocalAsset['fileId'], RemoteAsset['payload']>;
  imagesMeta: Record<LocalAsset['fileId'], DbFileMeta>;
  soundsMeta: Record<LocalAsset['fileId'], DbFileMeta>;
}

export type DbFileMeta = LocalAsset & { remoteId: RemoteAsset['id'] };

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
      this.validate();
    } else {
      logger.debug(`Db file does not exist.`);
    }
  }

  private validate() {
    const payloadKeys = Object.keys(this.payloads);
    const metaKeys = Object.keys(this.meta);
    const [ uniquePayloadKeys, _, uniqueMetaKeys ] = compareArrays(payloadKeys, metaKeys);
    if (uniquePayloadKeys.length) throw new Error(`Unique payload ids: ${uniquePayloadKeys.join(', ')}`);
    if (uniqueMetaKeys.length) throw new Error(`Unique meta ids: ${uniqueMetaKeys.join(', ')}`);
  }
}
