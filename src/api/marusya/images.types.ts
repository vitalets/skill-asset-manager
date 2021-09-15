export interface GetImagesResult {
  response: {
    items: Image[];
    count: number;
  }
}

export interface GetImageUploadLinkResult {
  response: {
    picture_upload_link: string;
  }
}

export interface UploadImageResult {
  server: number;
  photo: unknown;
  aid: number;
  hash: string;
  message_code: number;
}

export interface SaveImageResult {
  response: {
    app_id: number;
    photo_id: number;
  }
}

export interface DeleteImageResult {
  response: number;
}

export interface Image {
  id: number;
  owner_id: number;
}
