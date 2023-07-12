import { useEffect } from 'react';

import { useDisabledCW20TokensStore } from '../store';
import { useGetStorageLayer } from './global-vars';

export const DISABLED_CW20_TOKENS = 'disabled-cw20-tokens';

export function useInitDisabledCW20Tokens() {
  const storage = useGetStorageLayer();
  const { setDisabledCW20Tokens } = useDisabledCW20TokensStore();

  useEffect(() => {
    (async () => {
      const disabledCW20Tokens = await storage.get(DISABLED_CW20_TOKENS);
      if (disabledCW20Tokens) {
        const _disabledCW20Tokens = JSON.parse(disabledCW20Tokens);
        setDisabledCW20Tokens(_disabledCW20Tokens);
      } else {
        setDisabledCW20Tokens({});
      }
    })();
  }, []);
}
