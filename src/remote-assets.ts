import { AssetType, Platform } from './types';
import { AliceTarget, Target } from './config';
import { AliceImagesUniversalApi } from './alice/images.universal';
import { AliceSoundsUniversalApi } from './alice/sounds.universal';
import { MarusyaImagesUniversalApi } from './marusya/images.universal';
import { MarusyaSoundsUniversalApi } from './marusya/sounds.universal';
import { logger } from './logger';

export interface UniversalApi {
  getItems(): Promise<RemoteAsset[]>;
  uploadItem(filePath: string): Promise<void>;
  deleteItem(id: RemoteAsset['id']): Promise<void>;
}

export interface RemoteAsset {
  /** Идентификатор ресурса */
  id: string;
  /** То, что вставляется в ответ скилла */
  payload: string;
}

export interface RemoteAssetsConfig {
  target: Target
  assetType: AssetType
}

export class RemoteAssets {
  api: UniversalApi;
  items: RemoteAsset[] = [];

  constructor(private options: RemoteAssetsConfig) {
    this.api = this.createUniversalApi();
  }

  async load() {
    logger.debug(`Remote assets loading: ${this.options.assetType}`);
    this.items = await this.api.getItems();
    logger.debug(`Remote assets loaded: ${this.items.length}`);
  }

  private createUniversalApi(): UniversalApi {
    const { assetType, target } = this.options;
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
