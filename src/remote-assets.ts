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

export class RemoteAssets {
  api: UniversalApi;
  items: RemoteAsset[] = [];

  constructor(private assetType: AssetType, private target: Target) {
    this.api = this.createUniversalApi();
  }

  async load() {
    logger.debug(`Remote assets loading: ${this.assetType}`);
    this.items = await this.api.getItems();
    logger.debug(`Remote assets loaded: ${this.items.length}`);
  }

  private createUniversalApi(): UniversalApi {
    if (this.assetType === AssetType.images) {
      return isAliceTarget(this.target)
        ? new AliceImagesUniversalApi(this.target)
        : new MarusyaImagesUniversalApi(this.target);
    } else {
      return isAliceTarget(this.target)
        ? new AliceSoundsUniversalApi(this.target)
        : new MarusyaSoundsUniversalApi(this.target);
    }
  }
}

function isAliceTarget(target: Target): target is AliceTarget {
  return target.platform === Platform.alice;
}
