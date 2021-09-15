import fetch, { RequestInit} from 'node-fetch';
import { appendMessageToError } from '.';

export type FetchOptions = RequestInit;
export async function fetchJson(url: string, options: RequestInit) {
  const method = options.method || 'GET';
  const response = await fetch(url, options);
  if (response.ok) {
    try {
      return await response.json();
    } catch (e) {
      throw appendMessageToError(e, `${method} ${url}`);
    }
  } else {
    const text = await response.text();
    throw new Error(`${response.status} ${text} ${method} ${url}`);
  }
}
