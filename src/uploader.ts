// /**
//  * Uploads assets.
//  */
// import { DbFile } from './db-file';
// import { LocalAssets } from './local-assets';
// import { logger } from './logger';
// import { RemoteAssets } from './remote-assets';
// import { SyncingAsset } from './syncing-assets';

// export class Uploader {
//   constructor(private dbFile: DbFile, private localAssets: LocalAssets, private remoteAssets: RemoteAssets) { }

//   async run() {
//     try {

//     } finally {
//       await this.dbFile.save();
//     }
//   }

//   async uploadItems(item: SyncingAsset) {
//     for (const item of items) {
//       await this.uploadItem(item);
//     }
//   }

//   async uploadItem(item: SyncingAsset) {
//     const localAsset = this.localAssets.items[item.fileId];
//     logger.log(`Uploading: ${localAsset.file}`);
//     const remoteAsset = await this.remoteAssets.api.uploadItem(localAsset.file);
//     this.dbFile.upsertItem(localAsset, remoteAsset);
//   }
// }
