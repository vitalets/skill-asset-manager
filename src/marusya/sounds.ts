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
} from './sounds.types';

export class MarusyaSoundsApi extends MarusyaApi {
  async getItems() {
    const { response } = await this.request('/marusia.getAudios') as GetSoundsResult;
    return response.audios;
  }

  async getItem(id: number) {
    const items = await this.getItems();
    return items.find(items => items.id === id);
  }

  async uploadItem(filePath: string) {
    const url = await this.getUploadLink();
    const meta = await this.doUpload<UploadSoundResult>(url, filePath, 'file');
    const res = await this.saveSound(meta);
    return res;
  }

  async deleteItem(id: number) {
    const { response } = await this.request(`/marusia.deleteAudio?id=${id}`, { method: 'post' }) as DeleteSoundResult;
    if (response !== 1) throw new Error(`Error while deleting sound ${id}`);
  }

  getTts(id: number) {
    return `<speaker audio_vk_id="${this.options.ownerId}_${id}">`;
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
}
