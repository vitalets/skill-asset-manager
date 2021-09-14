/**
 * Wrapper over images api to provide universal interface.
 */
import { UniversalApi } from '../remote-assets';
import { MarusyaImagesApi } from './images';

export class MarusyaImagesUniversalApi implements UniversalApi {
  api: MarusyaImagesApi;

  constructor(...args: ConstructorParameters<typeof MarusyaImagesApi>) {
    this.api = new MarusyaImagesApi(...args);
  }

  async getItems() {
    const items = await this.api.getItems();
    return items.map(({ id }) => {
      return { id: String(id), payload: String(id) };
    });
  }

  async uploadItem(filePath: string) {
    await this.api.uploadItem(filePath);
  }

  async deleteItem(id: string) {
    await this.api.deleteItem(Number(id));
  }
}
