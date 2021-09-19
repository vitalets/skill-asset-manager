/**
 * Clean command.
 */
import { DbFile } from '../db-file';
import { LocalAsset } from '../local-assets';
import { RemoteAsset, RemoteAssets } from '../remote-assets';
import { confirm } from '../utils/confirm';
import { logger } from '../utils/logger';

export class Clean {
  /** Exists on remote, but no links in db file */
  unusedRemoteItems: RemoteAsset[] = [];
  /** Exists in db file cache, but not on remote */
  unusedDbItems: LocalAsset['hash'][] = [];

  constructor(private dbFile: DbFile, private remoteAssets: RemoteAssets) { }

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
    await this.remoteAssets.load();
  }

  private selectItems() {
    this.selectUnusedRemoteItems();
    this.selectUnusedDbItems();
  }

  private selectUnusedRemoteItems() {
    const knownRemoteIds = Object.values(this.dbFile.data.remoteIds);
    this.unusedRemoteItems = this.remoteAssets.items.filter(item => !knownRemoteIds.includes(item.id));
  }

  private selectUnusedDbItems() {
    const remoteIds = this.remoteAssets.getIds();
    const usedHashes = Object.values(this.dbFile.data.files).map(file => file.hash);
    this.unusedDbItems = Object.keys(this.dbFile.data.remoteIds).filter(hash => {
      const remoteId = this.dbFile.data.remoteIds[hash];
      return !usedHashes.includes(hash) && !remoteIds.includes(remoteId);
    });
  }

  private getUnusedItemsCount() {
    return this.unusedRemoteItems.length + this.unusedDbItems.length;
  }

  private showItems() {
    logger.separator();
    const assetType = this.assetType.toUpperCase();
    logger.log(`${assetType} UNUSED: ${this.getUnusedItemsCount()}`);
    this.unusedRemoteItems.forEach(({ id, desc }) => logger.log(`remote: ${desc ? `[${desc}] ` : ''}${id}`));
    this.unusedDbItems.forEach(hash => logger.log(`db-file: ${this.dbFile.data.remoteIds[hash]}`));
    logger.separator();
  }

  private noItems() {
    if (this.getUnusedItemsCount() === 0) {
      logger.log(`No unused ${this.assetType} found.`);
      return true;
    } else {
      return false;
    }
  }

  private async confirm() {
    const msg = `Are you sure to delete ${this.getUnusedItemsCount()} item(s)? y/[n]:`;
    const confirmed = await confirm(msg);
    if (!confirmed) logger.log('Skipped.');
    return confirmed;
  }

  private async doActions() {
    logger.separator();
    await this.deleteRemoteItems();
    this.deleteDbItems();
    logger.separator();
  }

  private async deleteRemoteItems() {
    for (const item of this.unusedRemoteItems) {
      await this.remoteAssets.deleteItem(item);
    }
  }

  private deleteDbItems() {
    for (const hash of this.unusedDbItems) {
      this.dbFile.forgetHash(hash);
    }
  }
}
