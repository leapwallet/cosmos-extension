import { useEffect } from 'react';

import { useFractionalizedNftContractsStore } from '../store';

export function useInitFractionalizedNftContracts() {
  const { setFractionalizedNftContracts } = useFractionalizedNftContractsStore();

  useEffect(() => {
    (async () => {
      const response = await fetch(
        'https://assets.leapwallet.io/cosmos-registry/v1/fractionalized-nft-contracts/nft-contracts.json',
      );
      const data = await response.json();
      setFractionalizedNftContracts(data);
    })();
  }, []);
}
