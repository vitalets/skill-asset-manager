export interface GetQuotaResult {
  images: {
    quota: Quota
  },
  sounds: {
    quota: Quota
  }
}

export interface Quota {
  total: number;
  used: number;
}
