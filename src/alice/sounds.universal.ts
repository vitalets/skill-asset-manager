/**
 * Wrapper over sounds api to provide universal interface.
 */
import { UniversalApi } from '../remote-assets';
import { AliceSoundsApi } from './sounds';

export class AliceSoundsUniversalApi implements UniversalApi {
  api: AliceSoundsApi;

  constructor(...args: ConstructorParameters<typeof AliceSoundsApi>) {
    this.api = new AliceSoundsApi(...args);
  }

  async getItems() {
    const items = await this.api.getItems();
    return items.map(({ id }) => {
      return { id, payload: this.api.getTts(id) };
    });
  }

  async uploadItem(filePath: string) {
    await this.api.uploadItem(filePath);
  }

  async deleteItem(id: string) {
    await this.api.deleteItem(id);
  }
}
