import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import { Defaults } from './utils';
import { logger } from './logger';

export interface LocalAssetsConfig {
  pattern: string;
  cwd?: string;
  getFileId?: (file: string) => string;
  transform?: (buffer: Blob, file: string) => Blob;
}

const defaults: Defaults<LocalAssetsConfig> = {
  cwd: process.cwd(),
  getFileId: file => path.basename(file),
  transform: buffer => buffer,
};

/**
 * Идентификатор ресурса, рассчитываемый из имени файла.
 * Именно он используется для обращения к ресурсу внутри скила.
 * По умолчанию равен имени файла (без расширения).
 * Можно кастомизировать получение fileId, когда в имени файла содержится разная другая мета-информация.
 * Например, можно записывать fileId в квадратных скобках: "my image[foo].png"
 */
export type FileId = string;

export interface FileInfo {
  /** Путь к файлу */
  file: string;
  /** Таймстемп последней модификации файла */
  mtimeMs: number;
}

export class LocalAssets {
  options: Required<LocalAssetsConfig>;
  items: Record<FileId, FileInfo> = {};

  constructor(options: LocalAssetsConfig) {
    this.options = Object.assign({}, defaults, options);
  }

  async load() {
    logger.debug(`Reading files from: ${this.options.pattern}`);
    const files = await fg(this.options.pattern, { onlyFiles: true });
    logger.debug(`Found files: ${files.length}`);
    files.forEach(file => {
      const fileId = this.getFileId(file);
      const { mtimeMs } = fs.statSync(file);
      this.items[fileId] = { file, mtimeMs };
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
