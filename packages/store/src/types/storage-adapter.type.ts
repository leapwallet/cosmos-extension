export type StorageAdapter = {
  set: (key: string, value: string) => Promise<void>;
  get: <t = any>(key: string) => Promise<t>;
  remove: (key: string) => Promise<void>;
};

export type DisableObject = {
  [key: string]: string[];
};
