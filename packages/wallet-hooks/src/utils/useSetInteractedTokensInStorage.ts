import { useAddress, useInteractedTokensStore } from '../store';
import { getDisabledKeySetter } from './getDisabledKeySetter';
import { useGetStorageLayer } from './global-vars';
import { INTERACTED_TOKENS } from './useInitInteractedTokens';

export function useSetInteractedTokensInStorage() {
  const storage = useGetStorageLayer();
  const address = useAddress();
  const { setInteractedTokens, interactedTokens: storedInteractedTokens } = useInteractedTokensStore();

  const setInteractedTokensInStorage = getDisabledKeySetter({
    setResource: (value) => setInteractedTokens(value),
    storageKey: INTERACTED_TOKENS,
    objectKey: address,
    storage,
    defaultResourceData: storedInteractedTokens,
  });

  return setInteractedTokensInStorage;
}
