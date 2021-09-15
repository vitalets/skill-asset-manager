/**
 * Wrapper over sounds api to provide universal interface.
 */
import { UniversalApi } from './types';
import { AliceSoundsApi } from '../alice/sounds';

export class AliceSoundsUniversalApi implements UniversalApi {
  platformApi: AliceSoundsApi;

  constructor(...args: ConstructorParameters<typeof AliceSoundsApi>) {
    this.platformApi = new AliceSoundsApi(...args);
  }

  async getItems() {
    const items = await this.platformApi.getItems();
    return items.map(({ id }) => {
      return { id, payload: this.platformApi.getTts(id) };
    });
  }

  async uploadItem(filePath: string) {
    await this.platformApi.uploadItem(filePath);
  }

  async deleteItem(id: string) {
    await this.platformApi.deleteItem(id);
  }
}
