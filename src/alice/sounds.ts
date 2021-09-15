/**
 * See: https://yandex.ru/dev/dialogs/alice/doc/resource-sounds-upload.html#http-load
 */

import { AliceApi, AliceApiOptions } from './base';
import { GetSoundsResult, GetSoundResult, UploadSoundResult } from './sounds.types';

export class AliceSoundsApi extends AliceApi {
  constructor(options: AliceApiOptions) {
    super(options);
    this.relativeUrl = `/skills/${this.options.skillId}/sounds`;
  }

  async getQuota() {
    const { sounds } = await this.getQuotaInternal();
    return sounds.quota;
  }

  async getItems() {
    const { sounds } = await this.getItemsInternal<GetSoundsResult>();
    return sounds;
  }

  async getItem(id: string) {
    const { sound } = await this.getItemInternal<GetSoundResult>(id);
    return sound;
  }

  async uploadItem(filePath: string) {
    const { sound } = await this.uploadItemInternal<UploadSoundResult>(filePath);
    return sound;
  }

  getTts(id: string) {
    return `<speaker audio="dialogs-upload/${this.options.skillId}/${id}.opus">`;
  }

  getUrl(id: string) {
    return `https://yastatic.net/s3/dialogs/dialogs-upload/sounds/opus/${this.options.skillId}/${id}.opus`;
  }
}
