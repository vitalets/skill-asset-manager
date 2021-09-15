export interface GetImagesResult {
  images: Image[];
  total: number;
}

export interface UploadImageResult {
  image: Image;
}

export interface DeleteImageResult {
  result: string;
}

export interface Image {
  id: string;
  origUrl: string | null;
  size: number;
  createdAt: string;
}
