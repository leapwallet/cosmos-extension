import { useEffect } from 'react';

import { useCustomChannelsStore } from '../store/useCustomChannelsStore';
import { useGetStorageLayer } from './global-vars';

export const CUSTOM_CHANNELS_STORE = 'custom-channels-store';

export function useInitCustomChannelsStore() {
  const storage = useGetStorageLayer();
  const { setChannels } = useCustomChannelsStore();

  useEffect(() => {
    const init = async () => {
      try {
        const customChannelsStore = await storage.get(CUSTOM_CHANNELS_STORE);
        if (!customChannelsStore) {
          await storage.set(CUSTOM_CHANNELS_STORE, '{}');
          setChannels({});
        } else {
          const store = JSON.parse(customChannelsStore);
          setChannels(store);
        }
      } catch {
        setChannels({});
      }
    };
    init();
  }, []);
}
