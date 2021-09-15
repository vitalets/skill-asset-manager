import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import { Defaults } from './utils/types';
import { logger } from './logger';

export interface LocalAsset {
  /**
   * Идентификатор ресурса, рассчитываемый из имени файла.
   * Именно он используется для обращения к ресурсу внутри скила.
   * По умолчанию равен имени файла (без расширения).
   * Можно кастомизировать получение fileId, когда в имени файла содержится разная другая мета-информация.
   * Например, можно записывать fileId в квадратных скобках: "my image[foo].png"
   */
  fileId: string;
  /** Путь к файлу */
  file: string;
  /** Таймстемп последней модификации файла */
  mtimeMs: number;
}

export interface LocalAssetsConfig {
  pattern: string;
  cwd?: string;
  getFileId?: (file: string) => string;
  transform?: (buffer: Blob, file: string) => Blob;
}

const defaults: Defaults<LocalAssetsConfig> = {
  cwd: process.cwd(),
  getFileId: file => path.parse(file).name,
  transform: buffer => buffer,
};

export class LocalAssets {
  options: Required<LocalAssetsConfig>;
  items: Record<LocalAsset['fileId'], LocalAsset> = {};

  constructor(options: LocalAssetsConfig) {
    this.options = Object.assign({}, defaults, options);
  }

  async load() {
    logger.debug(`Local files loading: ${this.options.pattern}`);
    const files = await fg(this.options.pattern, { onlyFiles: true });
    logger.debug(`Local files loaded: ${files.length}`);
    files.forEach(file => {
      const fileId = this.getFileId(file);
      const { mtimeMs } = fs.statSync(file);
      this.items[fileId] = { fileId, file, mtimeMs };
    });
  }

  private getFileId(file: string) {
    const fileId = this.options.getFileId(file);
    if (!fileId) throw new Error(`Empty file id "${fileId}" for:\n${file}`);
    if (typeof fileId !== 'string') throw new Error(`Not string file id "${fileId}" for:\n${file}`);
    if (Object.prototype.hasOwnProperty.call(this.items, fileId)) {
      throw new Error(`Duplicate file id "${fileId}" for:\n${file}\n${this.items[fileId].file}`);
    }
    return fileId;
  }
}
