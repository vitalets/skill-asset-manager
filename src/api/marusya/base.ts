/**
 * Base class for Marusya images and sounds.
 */
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { fetchJson, FetchOptions } from '../../utils/fetch';

const BASE_URL = 'https://api.vk.com/method';
const API_VERSION = '5.131';

export interface MarusyaApiOptions {
  token: string;
  /**
   * Чтобы узнать soundsOwnerId, нужно загрузить в навык один звук.
   * Пример: audio_vk_id: -2000512009_456239036 -> ownerId = -2000512009
   */
  soundsOwnerId: number;
}

export abstract class MarusyaApi {
  constructor(protected options: MarusyaApiOptions) {
    // Т.к. конфиг пишется на js, тут проверяем наличие полей
    this.assertOptions([ 'token', 'soundsOwnerId' ]);
  }

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

  private assertOptions(names: (keyof MarusyaApiOptions)[]) {
    for (const name of names) {
      if (!this.options[name]) {
        throw new Error(`Missing option "${name}" in target config.`);
      }
    }
  }
}
