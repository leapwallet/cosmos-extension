import { useEffect } from 'react';

import { useIteratedUriEnabledNftContractsStore } from '../store';

export function useInitIteratedUriNftContracts() {
  const { setIteratedUriEnabledNftContracts } = useIteratedUriEnabledNftContractsStore();

  useEffect(() => {
    (async () => {
      const response = await fetch(
        'https://assets.leapwallet.io/cosmos-registry/v1/iterated-uri-enabled-nft-contracts/nft-contracts.json',
      );
      const data = await response.json();
      setIteratedUriEnabledNftContracts(data);
    })();
  }, []);
}
