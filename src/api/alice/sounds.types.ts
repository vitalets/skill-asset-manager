export interface GetSoundsResult {
  sounds: Sound[];
  total: number;
}

export interface GetSoundResult {
  sound: Sound;
}

export interface UploadSoundResult {
  sound: Sound;
}

export interface DeleteSoundResult {
  result: string;
}

export interface Sound {
  id: string;
  skillId: string;
  size: number;
  originalName: string | null;
  createdAt: string;
  isProcessed: boolean;
  error: string | null;
}
