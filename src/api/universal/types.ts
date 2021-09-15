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
