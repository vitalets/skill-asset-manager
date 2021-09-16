/**
 * See: https://vk.com/dev/marusia_skill_docs10
 */
import { MarusyaApi } from './base';
import {
  GetSoundsResult,
  GetSoundUploadLinkResult,
  UploadSoundResult,
  SaveSoundResult,
  DeleteSoundResult,
  Sound,
} from './sounds.types';

export class MarusyaSoundsApi extends MarusyaApi {
  get ownerId() {
    return this.options.soundsOwnerId;
  }

  async getItems() {
    const { response } = await this.request('/marusia.getAudios') as GetSoundsResult;
    this.validateOwnerId(response.audios);
    return response.audios;
  }

  async getItem(id: number) {
    const items = await this.getItems();
    return items.find(items => items.id === id);
  }

  async uploadItem(filePath: string): Promise<Sound> {
    const url = await this.getUploadLink();
    const meta = await this.doUpload<UploadSoundResult>(url, filePath, 'file');
    const { id, title } = await this.saveSound(meta);
    return { id, title, owner_id: this.ownerId };
  }

  async deleteItem(id: number) {
    const { response } = await this.request(`/marusia.deleteAudio?id=${id}`, { method: 'post' }) as DeleteSoundResult;
    if (response !== 1) throw new Error(`Error while deleting sound ${id}`);
  }

  getTts(id: number) {
    return `<speaker audio_vk_id="${this.ownerId}_${id}">`;
  }

  protected async getUploadLink() {
    const { response } = await this.request('/marusia.getAudioUploadLink') as GetSoundUploadLinkResult;
    return response?.audio_upload_link;
  }

  protected async saveSound(meta: UploadSoundResult) {
    const metaParam = `audio_meta=${encodeURIComponent(JSON.stringify(meta))}`;
    const { response } = await this.request(`/marusia.createAudio?${metaParam}`) as SaveSoundResult;
    return response;
  }

  private validateOwnerId(items?: Sound[]) {
    const ownerIdFromApi = items?.[0]?.owner_id;
    if (ownerIdFromApi && ownerIdFromApi !== this.ownerId) {
      throw new Error(
        `Owner id mismatch! In config: "${this.ownerId}", in api response: ${ownerIdFromApi}`
      );
    }
  }
}
