export type StorageAdapter = {
  set: <T = string>(key: string, value: T, storageType?: string) => Promise<void>;
  get: <T = string>(key: string, storageType?: string) => Promise<T>;
  remove: (key: string) => Promise<void>;
};

export type DisableObject = {
  [key: string]: string[];
};
