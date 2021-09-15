/**
 * Wrapper over images api to provide universal interface.
 */
import { UniversalApi } from '../remote-assets';
import { MarusyaImagesApi } from './images';

export class MarusyaImagesUniversalApi implements UniversalApi {
  platformApi: MarusyaImagesApi;

  constructor(...args: ConstructorParameters<typeof MarusyaImagesApi>) {
    this.platformApi = new MarusyaImagesApi(...args);
  }

  async getItems() {
    const items = await this.platformApi.getItems();
    return items.map(({ id }) => {
      return { id: String(id), payload: String(id) };
    });
  }

  async uploadItem(filePath: string) {
    await this.platformApi.uploadItem(filePath);
  }

  async deleteItem(id: string) {
    await this.platformApi.deleteItem(Number(id));
  }
}
