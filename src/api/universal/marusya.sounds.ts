/**
 * Wrapper over sounds api to provide universal interface.
 */
import { UniversalApi } from './types';
import { MarusyaSoundsApi } from '../marusya/sounds';
import { Sound } from '../marusya/sounds.types';

export class MarusyaSoundsUniversalApi implements UniversalApi {
  platformApi: MarusyaSoundsApi;

  constructor(...args: ConstructorParameters<typeof MarusyaSoundsApi>) {
    this.platformApi = new MarusyaSoundsApi(...args);
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
    await this.platformApi.deleteItem(Number(id));
  }

  private toRemoteAsset({ id }: Sound) {
    return {
      id: String(id),
      payload: this.platformApi.getTts(id),
    };
  }
}
