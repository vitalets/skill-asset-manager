/**
 * File storing actual info about assets for particular skill.
 */
import fs from 'fs';
import path from 'path';
import { logger } from './utils/logger';
import { LocalAsset } from './local-assets';
import { RemoteAsset } from './remote-assets';
import { AssetType } from './types';
import { intersectArrays } from './utils';

export interface DbFileOptions {
  dbFilePath?: string;
  assetType: AssetType;
}

export interface DbFileData {
  /** fileId -> payload */
  payload: Record<LocalAsset['fileId'], RemoteAsset['payload']>;
  /** fileId -> info about local file */
  files: Record<LocalAsset['fileId'], Omit<LocalAsset, 'fileId'>>;
  /** Cache: hash -> info about remote asset */
  remoteIds: Record<LocalAsset['hash'], RemoteAsset['id']>;
}

export class DbFile {
  options: Required<DbFileOptions>;
  data: DbFileData = { payload: {}, files: {}, remoteIds: {} };

  constructor(options: DbFileOptions) {
    if (!options.dbFilePath) throw new Error(`Empty ${options.assetType}DbFile`);
    this.options = options as Required<DbFileOptions>;
  }

  get assetType() {
    return this.options.assetType;
  }

  async load() {
    const { dbFilePath } = this.options;
    logger.log(`Db file: ${dbFilePath}`);
    if (fs.existsSync(dbFilePath)) {
      const content = await fs.promises.readFile(dbFilePath, 'utf8');
      Object.assign(this.data, JSON.parse(content));
      logger.debug(`Db file loaded.`);
      this.validate();
    } else {
      logger.debug(`Db file does not exist.`);
    }
  }

  async save() {
    const { dbFilePath } = this.options;
    logger.log(`Db file saving: ${dbFilePath}`);
    await fs.promises.mkdir(path.dirname(dbFilePath), { recursive: true });
    const content = JSON.stringify(this.data, null, 2);
    await fs.promises.writeFile(dbFilePath, content);
    logger.debug(`Db file saved.`);
  }

  getFileIds() {
    return Object.keys(this.data.files);
  }

  getRemoteIds() {
    return Object.values(this.data.files)
      .map(item => this.data.remoteIds[item.hash])
      .filter(Boolean);
  }

  getRemoteId(fileId: LocalAsset['fileId']): RemoteAsset['id'] | undefined {
    const hash = this.data.files[fileId]?.hash;
    return this.data.remoteIds[hash];
  }

  upsertItem(localAsset: LocalAsset, { id, payload }: RemoteAsset) {
    const { fileId, file, hash } = localAsset;
    this.data.payload[fileId] = payload;
    this.data.files[fileId] = { file, hash };
    this.data.remoteIds[hash] = id;
  }

  forgetFile({ file, fileId }: LocalAsset) {
    logger.log(`forget file: [${fileId}] ${file}`);
    delete this.data.payload[fileId];
    delete this.data.files[fileId];
  }

  forgetHash(hash: LocalAsset['hash']) {
    const remoteId = this.data.remoteIds[hash];
    logger.log(`forget hash for: ${remoteId}`);
    delete this.data.remoteIds[hash];
  }

  private validate() {
    const keysPayloads = Object.keys(this.data.payload);
    const keysFiles = Object.keys(this.data.files);
    const [ uniqueKeysPayloads, _, uniqueKeysFiles ] = intersectArrays(keysPayloads, keysFiles);
    assertIncorrectFileIds(uniqueKeysPayloads, 'files');
    assertIncorrectFileIds(uniqueKeysFiles, 'payload');
  }
}

function assertIncorrectFileIds(uniqueFileIds: LocalAsset['fileId'][], dbFileProp: keyof DbFileData) {
  if (uniqueFileIds.length) {
    throw new Error([
      `DbFile incorrect. Some fileIds expected in prop "${dbFileProp}":`,
      uniqueFileIds.join(', '),
    ].join(' '));
  }
}
