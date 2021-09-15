/**
 * Wrapper over sounds api to provide universal interface.
 */
import { UniversalApi } from '../remote-assets';
import { MarusyaSoundsApi } from './sounds';

export class MarusyaSoundsUniversalApi implements UniversalApi {
  platformApi: MarusyaSoundsApi;

  constructor(...args: ConstructorParameters<typeof MarusyaSoundsApi>) {
    this.platformApi = new MarusyaSoundsApi(...args);
  }

  async getItems() {
    const items = await this.platformApi.getItems();
    return items.map(item => {
      return { id: String(item.id), payload: this.platformApi.getTts(item) };
    });
  }

  async uploadItem(filePath: string) {
    await this.platformApi.uploadItem(filePath);
  }

  async deleteItem(id: string) {
    await this.platformApi.deleteItem(Number(id));
  }
}
