/**
 * See: https://yandex.ru/dev/dialogs/alice/doc/resource-upload.html#http-images-load
 */

import { Base, BaseOptions } from './base';
import { GetImagesResult, UploadImageResult } from './images.types';

export class AliceImagesApi extends Base {
  constructor({ token, skillId }: Pick<BaseOptions, 'token' | 'skillId'>) {
    const relativeUrl = `/skills/${skillId}/images`;
    super({ token, skillId, relativeUrl });
  }

  async getQuota() {
    const { images } = await this.getQuotaInternal();
    return images.quota;
  }

  async getItems() {
    const { images } = await this.getItemsInternal<GetImagesResult>();
    return images;
  }

  async getItem(id: string) {
    const images = await this.getItems();
    return images.find(image => image.id === id);
  }

  async uploadItem(filePath: string) {
    const { image } = await this.uploadItemInternal<UploadImageResult>(filePath);
    return image;
  }

  getUrl(id: string) {
    return `https://avatars.mds.yandex.net/get-dialogs-skill-card/${id}/orig`;
  }
}
