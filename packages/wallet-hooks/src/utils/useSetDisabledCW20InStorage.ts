import { useAddress, useDisabledCW20TokensStore } from '../store';
import { getDisabledKeySetter } from './getDisabledKeySetter';
import { useGetStorageLayer } from './global-vars';
import { DISABLED_CW20_TOKENS } from './useInitDisabledCW20Tokens';

export function useSetDisabledCW20InStorage() {
  const storage = useGetStorageLayer();
  const address = useAddress();
  const { setDisabledCW20Tokens, disabledCW20Tokens: storedDisabledCW20Tokens } = useDisabledCW20TokensStore();

  const setDisabledCW20InStorage = getDisabledKeySetter({
    setResource: (value) => setDisabledCW20Tokens(value),
    storageKey: DISABLED_CW20_TOKENS,
    objectKey: address,
    storage,
    defaultResourceData: storedDisabledCW20Tokens,
  });

  return setDisabledCW20InStorage;
}
