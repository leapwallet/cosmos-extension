import { useMemo } from 'react';

import { useChainInfo } from './useChainInfo';
import { useSelectedNetwork } from './useSelectedNetwork';

export function useChainId() {
  const selectedNetwork = useSelectedNetwork();
  const chainInfo = useChainInfo();

  return useMemo(() => {
    return selectedNetwork === 'testnet' ? chainInfo?.testnetChainId : chainInfo?.chainId;
  }, [selectedNetwork, chainInfo]);
}
