/**
 * Wrapper over sounds api to provide universal interface.
 */
import { UniversalApi } from './types';
import { MarusyaSoundsApi } from '../marusya/sounds';

export class MarusyaSoundsUniversalApi implements UniversalApi {
  platformApi: MarusyaSoundsApi;

  constructor(...args: ConstructorParameters<typeof MarusyaSoundsApi>) {
    this.platformApi = new MarusyaSoundsApi(...args);
  }

  async getItems() {
    const items = await this.platformApi.getItems();
    return items.map(({ id }) => {
      return { id: String(id), payload: this.platformApi.getTts(id) };
    });
  }

  async uploadItem(filePath: string) {
    await this.platformApi.uploadItem(filePath);
  }

  async deleteItem(id: string) {
    await this.platformApi.deleteItem(Number(id));
  }
}
