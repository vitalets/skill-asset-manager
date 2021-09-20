/**
 * Sync command.
 */
import { DbFile } from '../db-file';
import { LocalAsset, LocalAssets } from '../local-assets';
import { RemoteAssets } from '../remote-assets';
import { intersectArrays, groupBy } from '../utils';
import { confirm } from '../utils/confirm';
import { logger } from '../utils/logger';

export class Sync {
  /** Exists in local dir, but not in db file */
  newFiles: LocalAsset[] = [];
  /** Exists in local dir and db file, but file changed */
  changedFiles: LocalAsset[] = [];
  /** Exists in db file, but deleted in local dir */
  deletedFiles: LocalAsset[] = [];
  /** Exists in local dir and db file, not changed, but not uploaded (or deleted) on remote */
  notUploadedFiles: LocalAsset[] = [];
  /** Exists in local dir and db file, not changed and exists on remote */
  syncedFiles: LocalAsset[] = [];
  /** newFiles + changedFiles + notUploadedFiles */
  needsSyncFiles: LocalAsset[] = [];

  constructor(private dbFile: DbFile, private localAssets: LocalAssets, private remoteAssets: RemoteAssets) { }

  get assetType() {
    return this.dbFile.assetType;
  }

  async run() {
    await this.loadItems();
    this.selectItems();
    this.showItems();
    if (this.noItems()) return;
    if (await this.confirm()) {
      await this.doActions();
      logger.log('Done.');
    }
  }

  private async loadItems() {
    await this.dbFile.load();
    await this.localAssets.load();
    await this.remoteAssets.load();
  }

  private selectItems() {
    const [ newFileIds, knownFileIds, deletedFileIds ] = this.compareActualFilesWithDbFile();
    const [ changedFileIds, notChangedFileIds ] = this.compareKnownFilesByHash(knownFileIds);
    const [ uploadedFileIds, notUploadedFileIds ] = this.compareNotChangedFilesWithRemote(notChangedFileIds);
    this.newFiles = newFileIds.map(fileId => this.localAssets.items[fileId]);
    this.changedFiles = changedFileIds.map(fileId => this.localAssets.items[fileId]);
    this.deletedFiles = deletedFileIds.map(fileId => ({ fileId, ...this.dbFile.data.files[fileId] }));
    this.notUploadedFiles = notUploadedFileIds.map(fileId => this.localAssets.items[fileId]);
    this.syncedFiles = uploadedFileIds.map(fileId => this.localAssets.items[fileId]);
    this.needsSyncFiles = this.newFiles.concat(this.changedFiles, this.notUploadedFiles);
  }

  private compareActualFilesWithDbFile() {
    const localFileIds = this.localAssets.getFileIds();
    const dbFileIds = this.dbFile.getFileIds();
    return intersectArrays(localFileIds, dbFileIds);
  }

  private compareKnownFilesByHash(commonFileIds: LocalAsset['fileId'][]) {
    const { true: changedFileIds = [], false: notChangedFileIds = [] } = groupBy(commonFileIds, fileId => {
      return this.localAssets.items[fileId].hash !== this.dbFile.data.files[fileId].hash;
    });
    return [ changedFileIds, notChangedFileIds ];
  }

  private compareNotChangedFilesWithRemote(notChangedFileIds: LocalAsset['fileId'][]) {
    const { true: uploadedFileIds = [], false: notUploadedFileIds = [] } = groupBy(notChangedFileIds, fileId => {
      const remoteId = this.dbFile.getRemoteId(fileId);
      return Boolean(this.remoteAssets.findById(remoteId));
    });
    return [ uploadedFileIds, notUploadedFileIds ];
  }

  private showItems() {
    logger.separator();
    const assetType = this.assetType.toUpperCase();
    logger.log(`${assetType} SYNCED: ${this.syncedFiles.length}`);
    logger.log(`${assetType} TO FORGET: ${this.deletedFiles.length}`);
    this.deletedFiles.forEach(a => logger.log(`deleted: [${a.fileId}] ${a.file}`));
    logger.log(`${assetType} TO SYNC: ${this.needsSyncFiles.length}`);
    this.newFiles.forEach(a => logger.log(`new: [${a.fileId}] ${a.file}`));
    this.changedFiles.forEach(a => logger.log(`changed: [${a.fileId}] ${a.file}`));
    this.notUploadedFiles.forEach(a => logger.log(`not uploaded: [${a.fileId}] ${a.file}`));
    logger.separator();
  }

  private noItems() {
    if (this.deletedFiles.length === 0 && this.needsSyncFiles.length === 0) {
      logger.log(`All ${this.assetType} synced.`);
      return true;
    } else {
      return false;
    }
  }

  private async confirm() {
    const actons = [
      this.deletedFiles.length && `forget ${this.deletedFiles.length} file(s)`,
      this.needsSyncFiles.length && `sync ${this.needsSyncFiles.length} file(s)`,
    ].filter(Boolean).join(' and ');
    const confirmed = await confirm(`Are you sure to ${actons}? y/[n]:`);
    if (!confirmed) logger.log('Skipped.');
    return confirmed;
  }

  private async doActions() {
    logger.separator();
    try {
      this.forgetFiles();
      await this.syncFiles();
    } finally {
      logger.separator();
      await this.dbFile.save();
    }
  }

  private forgetFiles() {
    for (const item of this.deletedFiles) {
      this.dbFile.forgetFile(item);
    }
  }

  private async syncFiles() {
    for (const item of this.needsSyncFiles) {
      await this.syncFile(item);
    }
  }

  private async syncFile(localAsset: LocalAsset) {
    const remoteAsset = this.tryReuseRemoteAsset(localAsset) || await this.uploadFile(localAsset);
    this.dbFile.upsertItem(localAsset, remoteAsset);
  }

  private tryReuseRemoteAsset(localAsset: LocalAsset) {
    const { fileId, file, hash } = localAsset;
    const cachedRemoteId = this.dbFile.data.remoteIds[hash];
    const remoteAsset = this.remoteAssets.findById(cachedRemoteId);
    if (remoteAsset) {
      logger.log(`reuse remote id: [${fileId}] ${file}`);
    }
    return remoteAsset;
  }

  private async uploadFile(localAsset: LocalAsset) {
    return this.remoteAssets.uploadItem(localAsset);
  }
}
