import axios from 'axios';

import { storage } from './global-vars';

type InitResourceFromS3 = {
  storage: storage;
  setResource: (param: any) => void;
  resourceURL: string;
  lastUpdatedAtURL: string;
  resourceKey: string;
  lastUpdatedAtKey: string;
  /**
   * If the resource is not found remotely, this will be used as is.
   * Note: This will not be transformed via transformResourceData function.
   */
  defaultResourceData?: any;
  /**
   * Apply any transformation to the resource data before setting it
   * in the store. The defaultResourceData will not be transformed.
   */
  transformResourceData?: (param: any) => any;
};

export async function initResourceFromS3({
  storage,
  setResource,
  resourceKey,
  resourceURL,
  lastUpdatedAtKey,
  lastUpdatedAtURL,
  defaultResourceData,
  transformResourceData = (param) => param,
}: InitResourceFromS3) {
  const lastUpdatedAtObj = await storage.get(lastUpdatedAtKey);

  try {
    if (lastUpdatedAtObj) {
      const storedLastUpdatedAtObj = JSON.parse(lastUpdatedAtObj);
      let lastUpdatedAtData: { lastUpdatedAt: string };

      try {
        const { data } = await axios.get(lastUpdatedAtURL);
        lastUpdatedAtData = data;
      } catch (e) {
        lastUpdatedAtData = {
          lastUpdatedAt: storedLastUpdatedAtObj.lastUpdatedAt,
        };
      }

      const newLastUpdatedAt = new Date(lastUpdatedAtData.lastUpdatedAt).getTime();
      const oldLastUpdatedAt = new Date(storedLastUpdatedAtObj.lastUpdatedAt).getTime();

      const resourceJson = await storage.get(resourceKey);

      let resource = JSON.parse(resourceJson ?? null);

      /**
       * difference between newLastUpdatedAt time and oldLastUpdatedAt
       * time in milliseconds
       */
      const diffBtwLastUpdatedAt = oldLastUpdatedAt - newLastUpdatedAt;

      if (!isNaN(diffBtwLastUpdatedAt) && diffBtwLastUpdatedAt < 0) {
        try {
          const { data: resourceData } = await axios.get(resourceURL);

          resource = resourceData;
          await storage.set(resourceKey, JSON.stringify(resourceData));
          await storage.set(lastUpdatedAtKey, JSON.stringify(lastUpdatedAtData));
        } catch (_) {
          //
        }
      }

      setResource(transformResourceData(resource));
    } else {
      try {
        const [{ data: lastUpdatedAtData }, { data: resourceData }] = await Promise.all([
          axios.get(lastUpdatedAtURL),
          axios.get(resourceURL),
        ]);

        await storage.set(resourceKey, JSON.stringify(resourceData));
        await storage.set(lastUpdatedAtKey, JSON.stringify(lastUpdatedAtData));
        setResource(transformResourceData(resourceData));
      } catch (_) {
        // do not transform defaultResourceData
        if (defaultResourceData) {
          setResource(defaultResourceData);
        }
      }
    }
  } catch (e: any) {
    if (e.message === '"[object Object]" is not valid JSON') {
      await storage.remove(lastUpdatedAtKey);
      await storage.remove(resourceKey);
    } else {
      console.log(e);
    }
  }
}
