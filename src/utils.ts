import fetch, { RequestInit} from 'node-fetch';

// eslint-disable-next-line @typescript-eslint/ban-types
export type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];
export type Defaults<T> = Required<Pick<T, OptionalKeys<T>>>;

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

function appendMessageToError(e: Error, message: string) {
  e.message = [ e.message, message ].join(' ');
  e.stack = `${e.name}: ${e.message}\n${(e.stack || '').split('\n').slice(1).join('\n')}`;
  return e;
}

