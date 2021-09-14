/**
 * File storing actual info about assets for particular skill.
 */
import fs from 'fs';
import { logger } from './logger';
import { FileId, FileInfo } from './local-assets';
import { RemoteAsset } from './remote-assets';

export interface DbFileData {
  images: Record<FileId, RemoteAsset['payload']>;
  sounds: Record<FileId, RemoteAsset['payload']>;
  meta: Record<FileId, Meta>;
}

export type Meta = FileInfo & { id: RemoteAsset['id'] };

export class DbFile {
  data!: DbFileData;

  constructor(private path: string) { }

  async load() {
    if (fs.existsSync(this.path)) {
      logger.debug(`Loading db file: ${this.path}`);
      const content = await fs.promises.readFile(this.path, 'utf8');
      return JSON.parse(content);
    } else {
      logger.debug(`Using fresh db file`);
      return { images: {}, sounds: {}, meta: {} };
    }
  }
}
