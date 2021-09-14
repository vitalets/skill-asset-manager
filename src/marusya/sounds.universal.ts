/**
 * Wrapper over sounds api to provide universal interface.
 */
import { UniversalApi } from '../remote-assets';
import { MarusyaSoundsApi } from './sounds';

export class MarusyaSoundsUniversalApi implements UniversalApi {
  api: MarusyaSoundsApi;

  constructor(...args: ConstructorParameters<typeof MarusyaSoundsApi>) {
    this.api = new MarusyaSoundsApi(...args);
  }

  async getItems() {
    const items = await this.api.getItems();
    return items.map(item => {
      return { id: String(item.id), payload: this.api.getTts(item) };
    });
  }

  async uploadItem(filePath: string) {
    await this.api.uploadItem(filePath);
  }

  async deleteItem(id: string) {
    await this.api.deleteItem(Number(id));
  }
}
