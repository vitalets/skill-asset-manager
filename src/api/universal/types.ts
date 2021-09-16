export interface UniversalApi {
  getItems(): Promise<RemoteAsset[]>;
  uploadItem(filePath: string): Promise<RemoteAsset>;
  deleteItem(id: RemoteAsset['id']): Promise<void>;
}

export interface RemoteAsset {
  /** Asset id on remote */
  id: string;
  /** Payload used in skill (for image it's id, for sound it's tts) */
  payload: string;
  /** Description */
  desc?: string;
}
