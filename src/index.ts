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
// import { Verify } from './commands/verify';

export class Runner {
  target: Target;
  localAssets: LocalAssets;
  dbFile: DbFile;
  remoteAssets: RemoteAssets;

  constructor(private config: Config, private assetType: AssetType, targetName: string) {
    this.target = this.config.getTarget(targetName);
    this.dbFile = new DbFile({ dbFilePath: this.getDbFilePath(), assetType });
    this.localAssets = new LocalAssets(this.target, this.getLocalAssetsConfig());
    this.remoteAssets = new RemoteAssets(this.target, assetType);
  }

  /**
   * Uploads changed assets and updates dbFile.
   */
  async sync() {
    this.logCommandTitle(`Syncing {assetType} for target: {target}`);
    await new Sync(this.dbFile, this.localAssets, this.remoteAssets).run();
  }

  /**
   * Verify that all assets from dbFile are uploaded on server
   */
   async verify() {
    this.logCommandTitle(`Verify {assetType} for target: {target}`);
    // await new Verify(this.dbFile, this.remoteAssets).run();
  }

  /**
   * Deletes remote assets not found in dbFile.
   */
  async clean() {
    this.logCommandTitle(`Delete unused remote {assetType} for target: {target}`);
    logger.log([
      '**CAUTION** Run carefully, only when some time passed after release!',
      'Otherwise rollback can be broken!',
    ].join(' '));
    await new Clean(this.dbFile, this.remoteAssets).run();
  }

  private getDbFilePath() {
    return this.assetType === AssetType.images
      ? this.target.imagesDbFile
      : this.target.soundsDbFile;
  }

  private getLocalAssetsConfig() {
    const assetsConfig = this.config.data[this.assetType];
    if (!assetsConfig) throw new Error(`Config should contain "${this.assetType}" prop.`);
    return assetsConfig;
  }

  private logCommandTitle(msg: string) {
    msg = msg
      .replace('{assetType}', this.assetType.toUpperCase())
      .replace('{target}', this.target.name.toUpperCase());
    logger.log('===');
    logger.log(msg);
  }
}
