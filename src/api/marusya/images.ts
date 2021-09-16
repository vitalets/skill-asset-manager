/**
 * See: https://vk.com/dev/marusia_skill_docs10
 */
import FormData from 'form-data';
import { MarusyaApi } from './base';
import {
  GetImagesResult,
  GetImageUploadLinkResult,
  UploadImageResult,
  SaveImageResult,
  DeleteImageResult,
  Image,
} from './images.types';

export class MarusyaImagesApi extends MarusyaApi {
  async getItems() {
    const { response } = await this.request('/marusia.getPictures') as GetImagesResult;
    return response.items;
  }

  async getItem(id: number) {
    const items = await this.getItems();
    return items.find(items => items.id === id);
  }

  async uploadItem(filePath: string): Promise<Image> {
    const url = await this.getUploadLink();
    const meta = await this.doUpload<UploadImageResult>(url, filePath, 'photo');
    const { photo_id } = await this.saveImage(meta);
    // Записываем owner_id=0, т.к. апи его не возвращает, да и он нигде не используется (для картинок!)
    return { id: photo_id, owner_id: 0 };
  }

  async deleteItem(id: number) {
    const { response } = await this.request(`/marusia.deletePicture?id=${id}`, { method: 'post' }) as DeleteImageResult;
    if (response !== 1) throw new Error(`Error while deleting image ${id}`);
  }

  protected async getUploadLink() {
    const { response } = await this.request('/marusia.getPictureUploadLink') as GetImageUploadLinkResult;
    return response?.picture_upload_link;
  }

  protected async saveImage({ server, hash, photo }: UploadImageResult) {
    const formData = new FormData();
    formData.append('server', server);
    formData.append('hash', hash);
    formData.append('photo', JSON.stringify(photo));
    const { response } = await this.request('/marusia.savePicture', {
      method: 'post',
      headers: formData.getHeaders(),
      body: formData,
    }) as SaveImageResult;
    return response;
  }
}
