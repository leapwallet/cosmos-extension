import { useEffect } from 'react';

import { NftChain } from '../../types';
import { useGetAllNFTsList } from '../useGetAllNFTsList';
import { NftContextType } from './types';

type useLoadNftDataParams = {
  nftChain: NftChain;
  index: string;
  nftChains: NftContextType['nftChains'];
  setIsLoading: NftContextType['setIsLoading'];
};

export function useLoadNftData({ nftChain, index, nftChains, setIsLoading }: useLoadNftDataParams) {
  const { forceChain, forceContractsListChain, forceNetwork } = nftChain;
  const { isLoading, data, refetch } = useGetAllNFTsList({
    forceChain,
    forceContractsListChain,
    forceNetwork,
  }) ?? { isLoading: false };

  useEffect(() => {
    if (isLoading) {
      setIsLoading((prevValue) => ({ ...prevValue, [index]: true }));
    }

    if (data && data.length === 0) {
      setIsLoading((prevValue) => ({ ...prevValue, [index]: false }));
    }

    if (data && data.length && data.every(({ tokens }) => tokens.length === 0)) {
      setIsLoading((prevValue) => ({ ...prevValue, [index]: false }));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isLoading, forceContractsListChain, data, nftChains?.length]);

  return { isLoading, data, refetch };
}
