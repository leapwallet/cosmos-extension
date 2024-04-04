import { useEffect } from 'react';

import { useEnabledCW20TokensStore } from '../store';
import { useGetStorageLayer } from './global-vars';

export const ENABLED_CW20_TOKENS = 'enabled-cw20-tokens';

export function useInitEnabledCW20Tokens() {
  const storage = useGetStorageLayer();
  const { setEnabledCW20Tokens } = useEnabledCW20TokensStore();

  useEffect(() => {
    (async () => {
      const enabledCW20Tokens = await storage.get(ENABLED_CW20_TOKENS);
      if (enabledCW20Tokens) {
        const _enabledCW20Tokens = JSON.parse(enabledCW20Tokens);
        setEnabledCW20Tokens(_enabledCW20Tokens);
      } else {
        setEnabledCW20Tokens({});
      }
    })();
  }, []);
}
