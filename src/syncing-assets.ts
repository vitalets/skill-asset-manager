/**
 * Compare data between local files, db file and remote.
 * Outputs list of SyncingAsset with actual states.
 */
import { DbFile } from './db-file';
import { LocalAsset, LocalAssets } from './local-assets';
import { RemoteAsset, RemoteAssets } from './remote-assets';
import { compareArrays } from './utils';
import { logger } from './logger';

export enum LocalState {
  /** Exists in local dir, but not in db file */
  NEW = 'NEW',
  /** Exists in db file, but not in local dir */
  DELETED = 'DELETED',
  /** Exists in both local dir and db file, but mktime changed */
  CHANGED = 'CHANGED',
  /** Exists in both local dir and db file and mktime not changed */
  NOT_CHANGED = 'NOT_CHANGED',
}

export enum RemoteState {
  /** Exists in db file, but not on remote */
  NOT_UPLOADED = 'NOT_UPLOADED',
  /** Exists on remote but not in db file */
  NOT_USED = 'NOT_USED',
  /** Exists in db file and on remote */
  UPLOADED = 'UPLOADED',
}

export interface SyncingAsset {
  fileId?: LocalAsset['fileId'];
  remoteId?: RemoteAsset['id'];
  localState?: LocalState;
  remoteState?: RemoteState;
}

export class SyncingAssets {
  items: SyncingAsset[] = [];

  constructor(private dbFile: DbFile, private localAssets: LocalAssets, private remoteAssets: RemoteAssets) { }

  compare() {
    this.compareLocalAssetsWithDbFile();
    this.compareRemoteAssetsWithDbFile();
  }

  private compareLocalAssetsWithDbFile() {
    const localFileIds = Object.keys(this.localAssets.items);
    const dbFileIds = Object.keys(this.dbFile.meta);
    const [ newFileIds, commonFileIds, deletedFileIds ] = compareArrays(localFileIds, dbFileIds);
    logger.debug(`Compare local assets with db:`, { newFileIds, commonFileIds, deletedFileIds });
    newFileIds.forEach(fileId => this.addLocalState(fileId, LocalState.NEW));
    commonFileIds.forEach(fileId => {
      const localAsset = this.localAssets.items[fileId];
      const dbMeta = this.dbFile.meta[fileId];
      const localState = localAsset.mtimeMs !== dbMeta.mtimeMs ? LocalState.CHANGED : LocalState.NOT_CHANGED;
      this.addLocalState(fileId, localState);
    });
    deletedFileIds.forEach(fileId => this.addLocalState(fileId, LocalState.DELETED));
  }

  private compareRemoteAssetsWithDbFile() {
    const dbMetaItems = Object.values(this.dbFile.meta);
    const dbIds = dbMetaItems.map(item => item.remoteId);
    const remoteIds = this.remoteAssets.items.map(item => item.id);
    const [ notUploadedIds, uploadedIds, notUsedIds ] = compareArrays(dbIds, remoteIds);
    logger.debug(`Compare remote assets with db:`, { notUploadedIds, uploadedIds, notUsedIds });
    notUploadedIds.forEach(remoteId => this.updateRemoteState(remoteId, RemoteState.NOT_UPLOADED));
    uploadedIds.forEach(remoteId => this.updateRemoteState(remoteId, RemoteState.UPLOADED));
    notUsedIds.forEach(remoteId => this.items.push({ remoteId, remoteState: RemoteState.NOT_USED }));
  }

  private addLocalState(fileId: SyncingAsset['fileId'], localState: SyncingAsset['localState']) {
    this.items.push({ fileId, localState });
  }

  private updateRemoteState(remoteId: SyncingAsset['remoteId'], remoteState: SyncingAsset['remoteState']) {
    const dbMeta = Object.values(this.dbFile.meta).find(item => item.remoteId === remoteId);
    // todo: better error msg
    if (!dbMeta) throw new Error(`dbMeta not found`);
    const item = this.items.find(item => item.fileId === dbMeta.fileId);
    if (!item) throw new Error(`item not found`);
    Object.assign(item, { remoteId, remoteState });
  }
}
