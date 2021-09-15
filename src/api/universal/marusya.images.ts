/**
 * Wrapper over images api to provide universal interface.
 */
import { UniversalApi } from './types';
import { MarusyaImagesApi } from '../marusya/images';
import { Image } from '../marusya/images.types';

export class MarusyaImagesUniversalApi implements UniversalApi {
  platformApi: MarusyaImagesApi;

  constructor(...args: ConstructorParameters<typeof MarusyaImagesApi>) {
    this.platformApi = new MarusyaImagesApi(...args);
  }

  async getItems() {
    const items = await this.platformApi.getItems();
    return items.map(item => this.toRemoteAsset(item));
  }

  async uploadItem(filePath: string) {
    const item = await this.platformApi.uploadItem(filePath);
    return this.toRemoteAsset(item);
  }

  async deleteItem(id: string) {
    await this.platformApi.deleteItem(Number(id));
  }

  private toRemoteAsset({ id }: Image) {
    return {
      id: String(id),
      payload: String(id),
    };
  }
}
