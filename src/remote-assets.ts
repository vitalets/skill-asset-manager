import { AssetType, Platform } from './types';
import { AliceTarget, Target } from './config';
import { logger } from './utils/logger';
import { UniversalApi, RemoteAsset } from './api/universal/types';
import { AliceImagesUniversalApi } from './api/universal/alice.images';
import { AliceSoundsUniversalApi } from './api/universal/alice.sounds';
import { MarusyaImagesUniversalApi } from './api/universal/marusya.images';
import { MarusyaSoundsUniversalApi } from './api/universal/marusya.sounds';
import { LocalAsset } from './local-assets';

export { RemoteAsset };

export class RemoteAssets {
  api: UniversalApi;
  items: RemoteAsset[] = [];

  constructor(private target: Target, private assetType: AssetType) {
    this.api = this.createUniversalApi();
  }

  async load() {
    logger.debug(`Remote ${this.assetType} loading`);
    this.items = await this.api.getItems();
    logger.debug(`Remote ${this.assetType}: ${this.items.length}`);
  }

  async uploadItem({ fileId, file }: LocalAsset) {
    logger.log(`Uploading: [${fileId}] ${file}`);
    return this.api.uploadItem(file);
  }

  async deleteItem({ id, desc }: RemoteAsset) {
    logger.log(`Deleting: ${id}${desc ? ` (${desc})` : ''}`);
    await this.api.deleteItem(id);
  }

  private createUniversalApi(): UniversalApi {
    const { assetType, target } = this;
    if (assetType === AssetType.images) {
      return isAliceTarget(target)
        ? new AliceImagesUniversalApi(target)
        : new MarusyaImagesUniversalApi(target);
    } else {
      return isAliceTarget(target)
        ? new AliceSoundsUniversalApi(target)
        : new MarusyaSoundsUniversalApi(target);
    }
  }
}

function isAliceTarget(target: Target): target is AliceTarget {
  return target.platform === Platform.alice;
}
