export interface GetSoundsResult {
  response: {
    audios: Sound[];
    count: number;
  }
}

export interface GetSoundUploadLinkResult {
  response: {
    audio_upload_link: string;
  }
}

export interface UploadSoundResult {
  sha: string;
  secret: string;
  meta: unknown;
  hash: string;
  server: string;
  user_id: string;
  request_id: string;
}

export interface SaveSoundResult {
  response: {
    id: number;
    title: string;
  }
}

export interface DeleteSoundResult {
  response: number;
}

export interface Sound {
  id: number;
  owner_id: number;
  title: string;
}
