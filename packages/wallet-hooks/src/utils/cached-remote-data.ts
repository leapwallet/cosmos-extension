import { storage } from './global-vars';

export type cachedRemoteDataArgs = {
  remoteUrl: string;
  storageKey: string;
  storage: storage;
};

export interface WithLastModified<T> {
  data: T;
  lastModified: number;
}

export const withLastModified = <T>(data: T, lastModified: number): WithLastModified<T> => {
  return {
    data,
    lastModified,
  };
};

export const cachedRemoteDataWithLastModified = async <T>({
  remoteUrl,
  storageKey,
  storage,
}: cachedRemoteDataArgs): Promise<T> => {
  const localData = await storage.get(storageKey);
  if (localData) {
    const entry = JSON.parse(localData) as WithLastModified<T>;
    try {
      const res = await fetch(remoteUrl, {
        method: 'GET',
        headers: {
          'If-Modified-Since': new Date(entry.lastModified).toUTCString(),
        },
      });
      if (res.ok) {
        const remoteData = await res.json();
        const lastModified = new Date(res.headers.get('last-modified') ?? Date.now()).getTime();
        await storage.set(storageKey, JSON.stringify(withLastModified(remoteData, lastModified)));
        return remoteData;
      } else {
        return entry.data;
      }
    } catch (e) {
      return entry.data;
    }
  } else {
    const res = await fetch(remoteUrl);
    if (res.ok) {
      const remoteData = await res.json();
      const lastModified = new Date(res.headers.get('last-modified') ?? Date.now()).getTime();
      await storage.set(storageKey, JSON.stringify(withLastModified(remoteData, lastModified)));
      return remoteData;
    } else {
      throw new Error(`Error fetching data from ${remoteUrl}`);
    }
  }
};
