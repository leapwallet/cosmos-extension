import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect, useState } from 'react';

import { useGetChains } from '../store';
import { getStorageLayer } from '../utils';

export function useIsTestnetActiveChain() {
  const [isTestnet, setIsTestnet] = useState(false);
  const chains = useGetChains();

  useEffect(() => {
    (async function isTestnetActiveChain() {
      const storage = getStorageLayer();
      const activeChain: SupportedChain = await storage.get('active-chain');
      const activeChainInfo = chains[activeChain];

      if (activeChainInfo && !activeChainInfo?.beta && activeChainInfo?.chainId === activeChainInfo?.testnetChainId) {
        setIsTestnet(true);
      }
    })();
  }, [chains]);

  return { isTestnet };
}
