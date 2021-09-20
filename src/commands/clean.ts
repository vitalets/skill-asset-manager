/**
 * Clean command.
 */
import { DbFile } from '../db-file';
import { LocalAsset } from '../local-assets';
import { RemoteAsset, RemoteAssets } from '../remote-assets';
import { confirm } from '../utils/confirm';
import { logger } from '../utils/logger';

export class Clean {
  /** Exists in db file cache, but not on remote */
  unusedLocalItems: LocalAsset['hash'][] = [];
  /** Exists on remote, but no links in db file */
  unusedRemoteItems: RemoteAsset[] = [];

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
    const allHashes = Object.keys(this.dbFile.data.remoteIds);
    const usedHashes = Object.values(this.dbFile.data.files).map(item => item.hash);
    const usedRemoteIds = usedHashes.map(hash => this.dbFile.data.remoteIds[hash]);
    this.unusedLocalItems = allHashes.filter(hash => !usedHashes.includes(hash));
    this.unusedRemoteItems = this.remoteAssets.items.filter(item => !usedRemoteIds.includes(item.id));
  }

  private getUnusedItemsCount() {
    return this.unusedLocalItems.length + this.unusedRemoteItems.length;
  }

  private showItems() {
    logger.separator();
    const assetType = this.assetType.toUpperCase();
    logger.log(`${assetType} UNUSED: ${this.getUnusedItemsCount()}`);
    this.unusedLocalItems.forEach(hash => logger.log(`local: ${this.dbFile.data.remoteIds[hash]}`));
    this.unusedRemoteItems.forEach(({ id, desc }) => logger.log(`remote: ${desc ? `[${desc}] ` : ''}${id}`));
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
    this.forgetLocalItems();
    logger.separator();
  }

  private async deleteRemoteItems() {
    for (const item of this.unusedRemoteItems) {
      await this.remoteAssets.deleteItem(item);
    }
  }

  private forgetLocalItems() {
    for (const hash of this.unusedLocalItems) {
      this.dbFile.forgetHash(hash);
    }
  }
}
