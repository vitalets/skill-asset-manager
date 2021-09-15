/**
 * Wrapper over images api to provide universal interface.
 */
import { UniversalApi } from '../remote-assets';
import { AliceImagesApi } from './images';

export class AliceImagesUniversalApi implements UniversalApi {
  platformApi: AliceImagesApi;

  constructor(...args: ConstructorParameters<typeof AliceImagesApi>) {
    this.platformApi = new AliceImagesApi(...args);
  }

  async getItems() {
    const items = await this.platformApi.getItems();
    return items.map(({ id }) => {
      return { id, payload: id };
    });
  }

  async uploadItem(filePath: string) {
    await this.platformApi.uploadItem(filePath);
  }

  async deleteItem(id: string) {
    await this.platformApi.deleteItem(id);
  }
}
