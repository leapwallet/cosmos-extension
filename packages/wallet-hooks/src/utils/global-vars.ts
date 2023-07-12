import { App } from '../connectors';
export enum APP_NAME {
  Compass = 'COMPASS',
  Cosmos = 'COSMOS',
}

let leapapiBaseUrl = '';
let platform: App = App.ChromeExtension;
let appName = APP_NAME.Cosmos;

export type storage = {
  set: (key: string, value: string) => Promise<void>;
  get: (key: string) => Promise<any>;
  remove: (key: string) => Promise<void>;
};

export const setStorageLayer = (storage: storage) => {
  if (window) {
    (window as any).storageLayer = storage;
  } else {
    (global as any).storageLayer = storage;
  }
};

export const getStorageLayer = (): storage => {
  if (window) {
    return (window as any).storageLayer;
  } else {
    return (global as any).storageLayer;
  }
};

export function useGetStorageLayer() {
  return getStorageLayer();
}

export const getLeapapiBaseUrl = () => {
  return leapapiBaseUrl;
};

export const setLeapapiBaseUrl = (url: string) => {
  leapapiBaseUrl = url;
};

export const setPlatform = (app: App) => {
  platform = app;
};

export const getPlatform = () => {
  return platform;
};

export const getAppName = () => {
  return appName;
};

export const setAppName = (name: APP_NAME) => {
  appName = name;
};
