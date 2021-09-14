/**
 * See: https://yandex.ru/dev/dialogs/alice/doc/resource-sounds-upload.html#http-load
 */

import { Base, BaseOptions } from './base';
import { GetSoundsResult, GetSoundResult, UploadSoundResult } from './sounds.types';

export class AliceSoundsApi extends Base {
  constructor({ token, skillId }: Pick<BaseOptions, 'token' | 'skillId'>) {
    const relativeUrl = `/skills/${skillId}/sounds`;
    super({ token, skillId, relativeUrl });
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
