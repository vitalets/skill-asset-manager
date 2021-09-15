import { Config, Target } from './config';
import { DbFile } from './db-file';
import { LocalAssets } from './local-assets';
import { RemoteAssets } from './remote-assets';
import { logger } from './logger';
import { AssetType } from './types';

export class AssetManager {
  target: Target;
  localAssets: LocalAssets;
  dbFile: DbFile;
  remoteAssets: RemoteAssets;

  constructor(private config: Config, private assetType: AssetType, private targetName: string) {
    // todo: reuse local assets
    this.target = this.config.getTarget(this.targetName);
    this.dbFile = new DbFile({ dbFile: this.target.dbFile, assetType });
    this.localAssets = this.createLocalAssets();
    this.remoteAssets = new RemoteAssets(this.assetType, this.target);
  }

  /**
   * Uploads changed assets and updates dbFile.
   */
  async sync() {
    logger.log(`SYNC ${this.assetType} for target: ${this.targetName}`);
    await this.dbFile.load();
    await this.localAssets.load();
    await this.remoteAssets.load();
    // find changed assets, mark and show them as to upload
    // get confirm from user
    // do upload
    // update and save db file
  }

  /**
   * Verifies that:
   * 1. all changed local assets are uploaded to remote
   * 2. all dbFile assets are found on remote
   */
  async verify() {
    logger.log(`VERIFY (${this.assetType}) for target: ${this.targetName}`);
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

  private createLocalAssets() {
    const assetsConfig = this.config.data[this.assetType];
    if (!assetsConfig) throw new Error(`Config should contain "${this.assetType}".`);
    return new LocalAssets(assetsConfig);
  }
}
