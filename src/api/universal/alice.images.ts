/**
 * Wrapper over images api to provide universal interface.
 */
import { UniversalApi } from './types';
import { AliceImagesApi } from '../alice/images';
import { Image } from '../alice/images.types';

export class AliceImagesUniversalApi implements UniversalApi {
  platformApi: AliceImagesApi;

  constructor(...args: ConstructorParameters<typeof AliceImagesApi>) {
    this.platformApi = new AliceImagesApi(...args);
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
    await this.platformApi.deleteItem(id);
  }

  private toRemoteAsset({ id }: Image) {
    return {
      id,
      payload: id,
    };
  }
}
