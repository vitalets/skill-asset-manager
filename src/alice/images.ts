/**
 * See: https://yandex.ru/dev/dialogs/alice/doc/resource-upload.html#http-images-load
 */

import { AliceApi, AliceApiOptions } from './base';
import { GetImagesResult, UploadImageResult } from './images.types';

export class AliceImagesApi extends AliceApi {
  constructor(options: AliceApiOptions) {
    super(options);
    this.relativeUrl = `/skills/${this.options.skillId}/images`;
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
