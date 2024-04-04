import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

import { useActiveChain, useAddress, useEnabledCW20TokensStore } from '../store';
import { getDisabledKeySetter } from './getDisabledKeySetter';
import { useGetStorageLayer } from './global-vars';
import { ENABLED_CW20_TOKENS } from './useInitEnabledCW20Tokens';

export function useSetEnabledCW20InStorage(forceChain?: SupportedChain) {
  const _activeChain = useActiveChain();
  const activeChain = forceChain || _activeChain;
  const storage = useGetStorageLayer();
  const address = useAddress(activeChain);
  const { setEnabledCW20Tokens, enabledCW20Tokens: storedEnabledCW20Tokens } = useEnabledCW20TokensStore();

  const setEnabledCW20InStorage = getDisabledKeySetter({
    setResource: (value) => setEnabledCW20Tokens(value),
    storageKey: ENABLED_CW20_TOKENS,
    objectKey: address,
    storage,
    defaultResourceData: storedEnabledCW20Tokens,
  });

  return setEnabledCW20InStorage;
}
