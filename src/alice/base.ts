/**
 * Base class for Alice images and sounds.
 */
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { fetchJson, FetchOptions } from '../utils';
import { GetQuotaResult } from './quota.types';

const BASE_URL = 'https://dialogs.yandex.net/api/v1';

export interface BaseOptions {
  token: string;
  skillId: string;
  relativeUrl: string;
}

export class Base {
  constructor(protected options: BaseOptions) { }

  protected async getQuotaInternal() {
    return await this.request('/status') as GetQuotaResult;
  }

  protected async getItemsInternal<T>() {
    return await this.request(this.options.relativeUrl) as T;
  }

  protected async getItemInternal<T>(id: string) {
    return await this.request(`${this.options.relativeUrl}/${id}`) as T;
  }

  protected async uploadItemInternal<T>(filePath: string) {
    const buffer = fs.createReadStream(filePath);
    const filename = path.basename(filePath);
    const formData = new FormData();
    formData.append('file', buffer, { filename });
    return await this.request(this.options.relativeUrl, {
      method: 'post',
      headers: formData.getHeaders(),
      body: formData,
    }) as T;
  }

  async deleteItem(id: string) {
    const url = `${this.options.relativeUrl}/${id}`;
    const result = await this.request(url, { method: 'delete' });
    if (result?.result !== 'ok') throw new Error(`Error while deleting item ${url}: ${result}`);
  }

  private async request(relativeUrl: string, options: FetchOptions = {}) {
    const url = `${BASE_URL}${relativeUrl}`;
    options = this.attachAuthHeader(options);
    return fetchJson(url, options);
  }

  private attachAuthHeader(options: FetchOptions) {
    options.headers = Object.assign({
      Authorization: `OAuth ${this.options.token}`,
    }, options.headers);
    return options;
  }
}
