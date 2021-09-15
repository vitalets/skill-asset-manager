import { Config, Target } from './config';
import { DbFile } from './db-file';
import { LocalAssets } from './local-assets';
import { RemoteAssets } from './remote-assets';
import { SyncingAssets } from './syncing-assets';
import { logger } from './logger';
import { AssetType } from './types';
// import { detectActions } from './actions';

export class AssetManager {
  target: Target;
  localAssets: LocalAssets;
  dbFile: DbFile;
  remoteAssets: RemoteAssets;
  syncingAssets: SyncingAssets;

  constructor(private config: Config, private assetType: AssetType, private targetName: string) {
    // todo: reuse local assets
    this.target = this.config.getTarget(this.targetName);
    this.dbFile = new DbFile({ dbFile: this.target.dbFile, assetType });
    this.localAssets = this.createLocalAssets();
    this.remoteAssets = this.createRemoteAssets();
    this.syncingAssets = new SyncingAssets(this.dbFile, this.localAssets, this.remoteAssets);
  }

  /**
   * Uploads changed assets and updates dbFile.
   */
  async sync() {
    logger.log(`SYNC ${this.assetType} for target: ${this.targetName}`);
    await this.loadAndCompare();
    // const actions = detectActions(this.syncingAssets.items);
    //console.log(actions)
    // mark and show them as to upload
    // get confirm from user
    // do upload
    // update and save db file
  }

  /**
   * Verifies that all items in dbFile are uploaded to remote.
   */
  async verify() {
    logger.log(`VERIFY (${this.assetType}) for target: ${this.targetName}`);
    await this.dbFile.load();
    await this.remoteAssets.load();
    // set asset status:
    // NOT_UPLOADED: in db file, mtime not changed but not exists on remote -> upload
  }

  /**
   * Deletes remote assets not found in dbFile.
   * CAUTION: use carefully, when some time passed after release! Otherwise rollback can be broken!
   */
  async clean() {
    logger.log(`CLEAN (${this.assetType}) for target: ${this.targetName}`);
    // find assets that exists on remove but not exists in dbFile (dbFile must be synced with local assets)
    // mark and show assets to delete
  }

  private async loadAndCompare() {
    await this.dbFile.load();
    await this.localAssets.load();
    await this.remoteAssets.load();
    this.syncingAssets.compare();
  }

  private createLocalAssets() {
    const assetsConfig = this.config.data[this.assetType];
    if (!assetsConfig) throw new Error(`Config should contain "${this.assetType}".`);
    return new LocalAssets(assetsConfig);
  }

  private createRemoteAssets() {
    return new RemoteAssets({
      target: this.target,
      assetType: this.assetType,
    });
  }
}
