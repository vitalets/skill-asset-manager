/**
 * Wrapper over images api to provide universal interface.
 */
import { UniversalApi } from '../remote-assets';
import { AliceImagesApi } from './images';

export class AliceImagesUniversalApi implements UniversalApi {
  api: AliceImagesApi;

  constructor(...args: ConstructorParameters<typeof AliceImagesApi>) {
    this.api = new AliceImagesApi(...args);
  }

  async getItems() {
    const items = await this.api.getItems();
    return items.map(({ id }) => {
      return { id, payload: id };
    });
  }

  async uploadItem(filePath: string) {
    await this.api.uploadItem(filePath);
  }

  async deleteItem(id: string) {
    await this.api.deleteItem(id);
  }
}
