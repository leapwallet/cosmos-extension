import { useEffect } from 'react';

import { useInteractedTokensStore } from '../store';
import { useGetStorageLayer } from './global-vars';

export const INTERACTED_TOKENS = 'interacted-tokens';

export function useInitInteractedTokens() {
  const storage = useGetStorageLayer();
  const { setInteractedTokens } = useInteractedTokensStore();

  useEffect(() => {
    (async () => {
      const interactedTokens = await storage.get(INTERACTED_TOKENS);
      if (interactedTokens) {
        const _interactedTokens = JSON.parse(interactedTokens);
        setInteractedTokens(_interactedTokens);
      } else {
        setInteractedTokens({});
      }
    })();
  }, []);
}
