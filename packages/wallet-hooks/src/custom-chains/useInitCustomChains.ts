import axios from 'axios';
import { useEffect } from 'react';

import { useCustomChainsStore } from '../store';
import { CustomChainsType } from '../utils';

const link = 'https://assets.leapwallet.io/cosmos-registry/v1/chains/custom-chains.json';
const testnetLink = 'https://assets.leapwallet.io/cosmos-registry/v1/chains/custom-testnet-chains.json';

const getMainnetChainStoreData = async () => {
  const chainsData: CustomChainsType[] = await axios
    .get(link)
    .then(({ data }) => data)
    .catch(console.error);

  if (chainsData?.length > 0) {
    return chainsData;
  } else {
    return [];
  }
};

const getTestnetChainStoreData = async () => {
  const chainsData: CustomChainsType[] = await axios
    .get(testnetLink)
    .then(({ data }) => data)
    .catch(console.error);

  if (chainsData?.length > 0) {
    return chainsData;
  } else {
    return [];
  }
};

export const useInitCustomChains = () => {
  const { setCustomChains } = useCustomChainsStore();

  useEffect(() => {
    (async () => {
      const _mainnetChains = await getMainnetChainStoreData();
      const _testnetChains = await getTestnetChainStoreData();
      setCustomChains([..._mainnetChains, ..._testnetChains]);
    })();
  }, []);
};
