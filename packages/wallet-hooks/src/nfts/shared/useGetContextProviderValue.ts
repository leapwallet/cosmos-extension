import { ChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import {
  useActiveChain,
  useDisabledNFTsCollections,
  useIsCompassWallet,
  useNftChains,
  useSelectedNetwork,
} from '../../store';
import { NftChain } from '../../types';
import { sortStringArr } from '../../utils';
import { OwnedCollectionTokenInfo } from '../types';
import { CollectionData, NftDetails } from './types';

type useGetContextProviderValueParams = {
  hiddenNfts: string[];
  chainInfos: Record<SupportedChain, ChainInfo>;
};

export function useGetContextProviderValue({ hiddenNfts, chainInfos }: useGetContextProviderValueParams) {
  const nftChains = useNftChains();
  const [nftDetails, setNftDetails] = useState<NftDetails>(null);
  const [activeTab, setActiveTab] = useState('All');
  const disabledNftsCollections = useDisabledNFTsCollections();
  const [triggerRerender, setTriggerRerender] = useState(false);
  const areAllNftsHiddenRef = useRef<boolean>(false);
  const isCompassWallet = useIsCompassWallet();

  const activeChain = useActiveChain();
  const _activeNetwork = useSelectedNetwork();
  const activeNetwork = useMemo(
    () => (activeChain === 'seiDevnet' ? 'mainnet' : _activeNetwork),
    [_activeNetwork, activeChain],
  );

  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [showCollectionDetailsFor, setShowCollectionDetailsFor] = useState('');
  const [showChainNftsFor, setShowChainNftsFor] = useState<SupportedChain>('' as SupportedChain);

  const _nftChains = useMemo(() => {
    return isCompassWallet
      ? nftChains.filter(
          ({ forceContractsListChain, forceNetwork }) =>
            forceContractsListChain === activeChain && forceNetwork === activeNetwork,
        )
      : nftChains.filter((nftChain: NftChain) => {
          if (nftChain.forceNetwork === 'testnet') {
            const chainInfo = chainInfos[nftChain.forceContractsListChain];

            if (chainInfo.chainId !== chainInfo.testnetChainId) {
              return false;
            }
          }

          return true;
        });
  }, [activeChain, activeNetwork, chainInfos, nftChains]);

  const isLoadingInitialValue = useMemo(
    () =>
      _nftChains.reduce((_isLoading, nft, index) => {
        let _loading = {
          ..._isLoading,
          [`${nft.forceContractsListChain}-${index}`]: true,
        };

        if (
          isCompassWallet &&
          (nft.forceContractsListChain === 'seiDevnet' || nft.forceContractsListChain === 'seiTestnet2')
        ) {
          _loading = {
            ..._loading,
            [`evm-${nft.forceContractsListChain}-${index}`]: true,
          };
        }

        return _loading;
      }, {}),
    [_nftChains],
  );

  const [isLoading, setIsLoading] = useState(isLoadingInitialValue);

  useLayoutEffect(() => {
    setIsLoading(isLoadingInitialValue);
  }, [isLoadingInitialValue, triggerRerender]);

  const _collectionData = useMemo(() => {
    if (hiddenNfts.length && collectionData) {
      const tempNfts = { ...collectionData.nfts };

      hiddenNfts.forEach((hiddenNft) => {
        const [address, tokenId] = hiddenNft.split('-');

        const collection = collectionData.collections?.find((collection) => collection.address === address);

        if (collection) {
          const { chain } = collection;
          const nfts: OwnedCollectionTokenInfo[] = tempNfts[chain];
          const _nfts = nfts.filter((nft) => (nft.tokenId ?? nft.domain) !== tokenId);

          if (_nfts.length) {
            tempNfts[chain] = _nfts;
          } else {
            delete tempNfts[chain];
          }
        }
      });

      if (Object.keys(tempNfts).length === 0 && Object.keys(collectionData.nfts).length !== 0) {
        areAllNftsHiddenRef.current = true;
      } else {
        areAllNftsHiddenRef.current = false;
      }

      return { collections: collectionData.collections, nfts: tempNfts };
    }

    areAllNftsHiddenRef.current = false;
    return collectionData;
  }, [collectionData, hiddenNfts]);

  const sortedCollectionChains = useMemo(() => {
    const collectionChains =
      _collectionData?.collections.reduce((_collectionChains: SupportedChain[], collection) => {
        if (
          collection.totalNfts &&
          !disabledNftsCollections.includes(collection.address) &&
          !_collectionChains.includes(collection.chain) &&
          Object.keys(_collectionData.nfts).includes(collection.chain)
        ) {
          return [..._collectionChains, collection.chain];
        }

        return _collectionChains;
      }, []) ?? [];

    return sortStringArr(collectionChains) as SupportedChain[];
  }, [_collectionData?.collections, _collectionData?.nfts, disabledNftsCollections]);

  const _isLoading = Object.values(isLoading).includes(true);

  return {
    areAllNftsHiddenRef,
    collectionData,
    _collectionData,
    setCollectionData,
    isLoading,
    setIsLoading,
    _isLoading,
    activeTab,
    setActiveTab,
    showCollectionDetailsFor,
    setShowCollectionDetailsFor,
    nftDetails,
    setNftDetails,
    nftChains: _nftChains,
    sortedCollectionChains,
    showChainNftsFor,
    setShowChainNftsFor,
    setTriggerRerender,
    triggerRerender,
  };
}
