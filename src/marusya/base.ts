/**
 * Base class for Marusya images and sounds.
 */
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { fetchJson, FetchOptions } from '../utils';

const BASE_URL = 'https://api.vk.com/method';
const API_VERSION = '5.131';

export interface BaseOptions {
  token: string;
}

export abstract class Base {
  constructor(protected options: BaseOptions) { }

  protected async doUpload<T>(url: string, filePath: string, field: string) {
    const buffer = fs.createReadStream(filePath);
    const filename = path.basename(filePath);
    const formData = new FormData();
    formData.append(field, buffer, { filename });
    return await this.request(url, {
      method: 'post',
      headers: formData.getHeaders(),
      body: formData,
    }) as T;
  }

  protected async request(relativeUrl: string, options: FetchOptions = {}) {
    const url = /^https:/.test(relativeUrl) ? relativeUrl : `${BASE_URL}${relativeUrl}`;
    const urlWithToken = this.attachAuthQuery(url);
    const res = await fetchJson(urlWithToken, options);
    if (res?.error) throw new Error(JSON.stringify(res));
    return res;
  }

  private attachAuthQuery(url: string) {
    return `${url}${url.includes('?') ? '&' : '?'}access_token=${this.options.token}&v=${API_VERSION}`;
  }
}
