/**
 * Clean command.
 */
import { DbFile } from '../db-file';
import { RemoteAsset, RemoteAssets } from '../remote-assets';
import { compareArrays } from '../utils';
import { confirm } from '../utils/confirm';
import { logger } from '../utils/logger';

export class Clean {
  /** Exists in db file, but not on remote */
  unusedItems: RemoteAsset[] = [];

  constructor(private dbFile: DbFile, private remoteAssets: RemoteAssets) { }

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
    const remoteIds = this.remoteAssets.items.map(item => item.id);
    const dbIds = Object.values(this.dbFile.meta).map(item => item.remoteId);
    const [ unusedIds ] = compareArrays(remoteIds, dbIds);
    this.unusedItems = this.remoteAssets.items.filter(({ id }) => unusedIds.includes(id));
  }

  private showItems() {
    logger.separator();
    logger.log(`UNUSED FILES: ${this.unusedItems.length}`);
    this.unusedItems.forEach(({ id, desc }) => logger.log(`${desc ? `[${desc}] ` : ''}${id}`));
    logger.separator();
  }

  private noItems() {
    if (this.unusedItems.length === 0) {
      logger.log('No unused files found.');
      return true;
    } else {
      return false;
    }
  }

  private async confirm() {
    const msg = `Are you sure to delete ${this.unusedItems.length} file(s) on remote? y/[n]:`;
    const confirmed = await confirm(msg);
    if (!confirmed) logger.log('Skipped.');
    return confirmed;
  }

  private async doActions() {
    logger.separator();
    for (const item of this.unusedItems) {
      await this.remoteAssets.deleteItem(item);
    }
    logger.separator();
  }
}
