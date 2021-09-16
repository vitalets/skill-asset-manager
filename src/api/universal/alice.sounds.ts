/**
 * Wrapper over sounds api to provide universal interface.
 */
import { UniversalApi } from './types';
import { AliceSoundsApi } from '../alice/sounds';
import { Sound } from '../alice/sounds.types';

export class AliceSoundsUniversalApi implements UniversalApi {
  platformApi: AliceSoundsApi;

  constructor(...args: ConstructorParameters<typeof AliceSoundsApi>) {
    this.platformApi = new AliceSoundsApi(...args);
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

  private toRemoteAsset({ id, originalName }: Sound) {
    return {
      id,
      payload: this.platformApi.getTts(id),
      desc: originalName || '',
    };
  }
}
