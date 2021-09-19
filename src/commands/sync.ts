/**
 * Sync command.
 */
import { DbFile } from '../db-file';
import { LocalAsset, LocalAssets } from '../local-assets';
import { RemoteAssets } from '../remote-assets';
import { compareArrays, groupBy } from '../utils';
import { confirm } from '../utils/confirm';
import { logger } from '../utils/logger';

export class Sync {
  /** Exists in local dir, but not in db file */
  newFiles: LocalAsset[] = [];
  /** Exists in local dir and db file, but file changed */
  changedFiles: LocalAsset[] = [];
  /** Exists in db file, but deleted in local dir */
  deletedFiles: LocalAsset[] = [];
  /** Exists in local dir and db file, not changed, but missing on remote */
  missingOnRemoteFiles: LocalAsset[] = [];
  /** Exists in local dir and db file, not changed and exists on remote */
  syncedFiles: LocalAsset[] = [];
  /** newFiles + changedFiles + notUploadedFiles */
  needsUploadFiles: LocalAsset[] = [];

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
    const [ newFileIds, commonFileIds, deletedFileIds ] = this.findNewCommonAndDeletedFileIds();
    const [ changedFileIds, notChangedFileIds ] = this.findChangedFileIds(commonFileIds);
    const [ uploadedFileIds, notUploadedFileIds ] = this.findUploadedFileIds(notChangedFileIds);
    this.newFiles = newFileIds.map(fileId => this.localAssets.items[fileId]);
    this.changedFiles = changedFileIds.map(fileId => this.localAssets.items[fileId]);
    this.deletedFiles = deletedFileIds.map(fileId => this.dbFile.meta[fileId]);
    this.missingOnRemoteFiles = notUploadedFileIds.map(fileId => this.localAssets.items[fileId]);
    this.syncedFiles = uploadedFileIds.map(fileId => this.localAssets.items[fileId]);
    this.needsUploadFiles = this.newFiles.concat(this.changedFiles, this.missingOnRemoteFiles);
  }

  private findNewCommonAndDeletedFileIds() {
    const localFileIds = Object.keys(this.localAssets.items);
    const dbFileIds = Object.keys(this.dbFile.meta);
    return compareArrays(localFileIds, dbFileIds);
  }

  private findChangedFileIds(commonFileIds: LocalAsset['fileId'][]) {
    const { true: changedFileIds = [], false: notChangedFileIds = [] } = groupBy(commonFileIds, fileId => {
      return this.localAssets.items[fileId].hash !== this.dbFile.meta[fileId].hash;
    });
    return [ changedFileIds, notChangedFileIds ];
  }

  private findUploadedFileIds(notChangedFileIds: LocalAsset['fileId'][]) {
    const { true: uploadedFileIds = [], false: notUploadedFileIds = [] } = groupBy(notChangedFileIds, fileId => {
      const { remoteId } = this.dbFile.meta[fileId];
      return this.remoteAssets.items.some(item => item.id === remoteId);
    });
    return [ uploadedFileIds, notUploadedFileIds ];
  }

  private showItems() {
    logger.separator();
    const assetType = this.assetType.toUpperCase();
    logger.log(`${assetType} SYNCED: ${this.syncedFiles.length}`);
    logger.log(`${assetType} TO FORGET: ${this.deletedFiles.length}`);
    this.deletedFiles.forEach(a => logger.log(`- deleted: [${a.fileId}] ${a.file}`));
    logger.log(`${assetType} TO UPLOAD: ${this.needsUploadFiles.length}`);
    this.newFiles.forEach(a => logger.log(`- new: [${a.fileId}] ${a.file}`));
    this.changedFiles.forEach(a => logger.log(`- changed: [${a.fileId}] ${a.file}`));
    this.missingOnRemoteFiles.forEach(a => logger.log(`- missing on remote: [${a.fileId}] ${a.file}`));
    logger.separator();
  }

  private noItems() {
    if (this.deletedFiles.length === 0 && this.needsUploadFiles.length === 0) {
      logger.log(`All ${this.assetType} synced.`);
      return true;
    } else {
      return false;
    }
  }

  private async confirm() {
    const actons = [
      this.deletedFiles.length && `forget ${this.deletedFiles.length} file(s)`,
      this.needsUploadFiles.length && `upload ${this.needsUploadFiles.length} file(s)`,
    ].filter(Boolean).join(' and ');
    const confirmed = await confirm(`Are you sure to ${actons}? y/[n]:`);
    if (!confirmed) logger.log('Skipped.');
    return confirmed;
  }

  private async doActions() {
    logger.separator();
    try {
      this.forgetItems();
      await this.uploadItems();
    } finally {
      logger.separator();
      await this.dbFile.save();
    }
  }

  private forgetItems() {
    for (const item of this.deletedFiles) {
      this.dbFile.deleteItem(item);
    }
  }

  private async uploadItems() {
    for (const item of this.needsUploadFiles) {
      await this.uploadItem(item);
    }
  }

  private async uploadItem(localAsset: LocalAsset) {
    const remoteAsset = await this.remoteAssets.uploadItem(localAsset);
    this.dbFile.upsertItem(localAsset, remoteAsset);
  }
}
