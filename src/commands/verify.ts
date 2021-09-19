// /**
//  * Verify command.
//  */
// import { DbFile, DbFileMeta } from '../db-file';
// import { RemoteAssets } from '../remote-assets';
// import { groupBy } from '../utils';
// import { logger } from '../utils/logger';

// export class Verify {
//   /** Exists in db file and on remote */
//   uploadedFiles: DbFileMeta[] = [];
//   /** Exists in db file, but not on remote */
//   notUploadedFiles: DbFileMeta[] = [];

//   constructor(private dbFile: DbFile, private remoteAssets: RemoteAssets) { }

//   get assetType() {
//     return this.dbFile.assetType;
//   }

//   async run() {
//     await this.loadItems();
//     this.selectItems();
//     this.showItems();
//     this.assertAllItemsUploaded();
//   }

//   private async loadItems() {
//     await this.dbFile.load();
//     await this.remoteAssets.load();
//   }

//   private selectItems() {
//     const dbFileIds = Object.keys(this.dbFile.meta);
//     const { true: uploadedFileIds = [], false: notUploadedFileIds = [] } = groupBy(dbFileIds, fileId => {
//       const { remoteId } = this.dbFile.meta[fileId];
//       return this.remoteAssets.items.some(item => item.id === remoteId);
//     });
//     this.uploadedFiles = uploadedFileIds.map(fileId => this.dbFile.meta[fileId]);
//     this.notUploadedFiles = notUploadedFileIds.map(fileId => this.dbFile.meta[fileId]);
//   }

//   private showItems() {
//     logger.separator();
//     const assetType = this.assetType.toUpperCase();
//     logger.log(`${assetType} UPLOADED: ${this.uploadedFiles.length}`);
//     logger.log(`${assetType} NOT UPLOADED: ${this.notUploadedFiles.length}`);
//     this.notUploadedFiles.forEach(a => logger.log(`- not uploaded: [${a.fileId}] ${a.file}`));
//     logger.separator();
//   }

//   private assertAllItemsUploaded() {
//     if (this.notUploadedFiles.length > 0) {
//       logger.log(`ERROR! Some ${this.assetType} from dbFile not found on remote!`);
//       process.exit(1);
//     } else {
//       logger.log(`SUCCESS! All ${this.assetType} from db file found on remote.`);
//     }
//   }
// }
