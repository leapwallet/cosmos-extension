import { useEffect } from 'react';

import { useBetaEvmNftTokenIdsStore } from '../store';
import { useGetStorageLayer } from '../utils';

export const BETA_EVM_NFT_TOKEN_IDS = 'beta-evm-nft-token-ids';

export function useInitBetaEvmNftTokenIds() {
  const storage = useGetStorageLayer();
  const { setBetaEvmNftTokenIds } = useBetaEvmNftTokenIdsStore();

  useEffect(() => {
    (async function () {
      const storedBetaEvmNftTokenIds = await storage.get(BETA_EVM_NFT_TOKEN_IDS);

      if (storedBetaEvmNftTokenIds) {
        const betaEvmNftTokenIds = JSON.parse(storedBetaEvmNftTokenIds);
        setBetaEvmNftTokenIds(betaEvmNftTokenIds);
      }
    })();
  }, []);
}
