/**
 * Runner for commands.
 */
import { Config, Target } from './config';
import { DbFile } from './db-file';
import { LocalAssets } from './local-assets';
import { RemoteAssets } from './remote-assets';
import { logger } from './utils/logger';
import { AssetType } from './types';
import { Sync } from './commands/sync';
import { Clean } from './commands/clean';

export class Runner {
  target: Target;
  localAssets: LocalAssets;
  dbFile: DbFile;
  remoteAssets: RemoteAssets;

  constructor(private config: Config, private assetType: AssetType, private targetName: string) {
    this.target = this.config.getTarget(this.targetName);
    this.dbFile = new DbFile({ dbFile: this.target.dbFile, assetType });
    this.localAssets = this.createLocalAssets();
    this.remoteAssets = this.createRemoteAssets();
  }

  /**
   * Uploads changed assets and updates dbFile.
   */
  async sync() {
    logger.log('===');
    logger.log(`Syncing ${this.assetType.toUpperCase()} for target: ${this.targetName.toUpperCase()}`);
    await new Sync(this.dbFile, this.localAssets, this.remoteAssets).run();
  }

  /**
   * Deletes remote assets not found in dbFile.
   */
  async clean() {
    logger.log('===');
    logger.log(`Delete unused remote ${this.assetType.toUpperCase()} for target: ${this.targetName.toUpperCase()}`);
    logger.log([
      '**CAUTION**! Run carefully, only when some time passed after release!',
      'Otherwise rollback can be broken!',
    ].join(' '));
    await new Clean(this.dbFile, this.remoteAssets).run();
  }

  /**
   * TODO: Verifies that all items in dbFile are uploaded to remote.
   */

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
