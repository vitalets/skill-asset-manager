import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import { Defaults } from './utils/types';
import { logger } from './utils/logger';
import { appendMessageToError } from './utils';
import { Target } from './config';

export interface LocalAsset {
  /**
   * Идентификатор ресурса, рассчитываемый из имени файла.
   * Именно он используется для обращения к ресурсу внутри скила.
   * По умолчанию равен имени файла (без расширения).
   * Можно кастомизировать получение fileId, когда в имени файла содержится разная другая мета-информация.
   * Например, можно записывать fileId в квадратных скобках: "[image]_800x600.png".
   * Тогда функция getFileId: file => path.parse(file).name.match(/\[([^\]]+)\]/i)[1];
   */
  fileId: string;
  /** Путь к файлу */
  file: string;
  /** Таймстемп последней модификации файла */
  mtimeMs: number;
}

export interface LocalAssetsConfig {
  /**
   * Glob pattern to local assets.
   * '{platform}' is replaced with actual platform: alice|marusya
   */
  pattern: string;
  cwd?: string;
  getFileId?: (file: string) => string;
}

const defaults: Defaults<LocalAssetsConfig> = {
  cwd: process.cwd(),
  getFileId: file => path.parse(file).name,
};

export class LocalAssets {
  options: Required<LocalAssetsConfig>;
  items: Record<LocalAsset['fileId'], LocalAsset> = {};

  constructor(private target: Target, options: LocalAssetsConfig) {
    this.options = Object.assign({}, defaults, options);
  }

  async load() {
    const files = await this.readFiles();
    files.forEach(file => this.addItem(file));
  }

  private getFileId(file: string) {
    let fileId = '';
    try {
      fileId = this.options.getFileId(file);
    } catch (e) {
      throw appendMessageToError(e, `Can not get fileId for: ${file}`);
    }
    if (!fileId) throw new Error(`Empty file id "${fileId}" for:\n${file}`);
    if (typeof fileId !== 'string') throw new Error(`Not string file id "${fileId}" for:\n${file}`);
    if (Object.prototype.hasOwnProperty.call(this.items, fileId)) {
      throw new Error(`Duplicate file id "${fileId}" for:\n${file}\n${this.items[fileId].file}`);
    }
    return fileId;
  }

  private async readFiles() {
    const pattern = this.options.pattern.replace('{platform}', this.target.platform);
    logger.log(`Local files: ${pattern}`);
    const files = await fg(pattern, { onlyFiles: true });
    logger.debug(`Local files found: ${files.length}`);
    return files;
  }

  private addItem(file: string) {
    const fileId = this.getFileId(file);
    const { mtimeMs } = fs.statSync(file);
    this.items[fileId] = { fileId, file, mtimeMs };
  }
}
