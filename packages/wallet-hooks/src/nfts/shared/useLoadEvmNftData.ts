import { getNftContractInfo, getNftTokenIdInfo } from '@leapwallet/cosmos-wallet-sdk';
import { OmniflixNft, OwnedCollectionTokenInfo } from 'nfts/types';
import { useEffect } from 'react';

import { useActiveChain, useBetaEvmNftTokenIds, useChainApis, useSelectedNetwork } from '../../store';
import { normalizeImageSrc } from '../../utils';
import { useLoadNftContractsList } from '../utils';
import { NftContextType, useLoadNftDataParams } from './index';

export type useLoadEvmNftDataParams = useLoadNftDataParams & {
  setCollectionData: NftContextType['setCollectionData'];
  walletAddress: string;
};

export function useLoadEvmNftData({
  nftChain,
  index,
  nftChains,
  setIsLoading,
  setCollectionData,
  walletAddress,
}: useLoadEvmNftDataParams) {
  const { forceChain, forceNetwork } = nftChain;
  const betaEvmNftTokenIds = useBetaEvmNftTokenIds();

  const _chain = useActiveChain();
  const chain = forceChain ?? _chain;

  const _activeNetwork = useSelectedNetwork();
  const activeNetwork = forceNetwork ?? _activeNetwork;

  const { evmJsonRpc } = useChainApis(chain, activeNetwork);
  const { data: nftContractsList, status: nftContractsListStatus } = useLoadNftContractsList(
    chain,
    activeNetwork,
    '',
    true,
  );

  useEffect(() => {
    if (nftContractsListStatus === 'success' && nftContractsList && evmJsonRpc) {
      if (nftContractsList.length === 0) {
        setIsLoading((prevValue) => ({ ...prevValue, [index]: false }));
        return;
      }

      nftContractsList.forEach(async (nftContract) => {
        const { address } = nftContract;
        const tokenIds = betaEvmNftTokenIds?.[address]?.[walletAddress] ?? [];

        if (tokenIds.length !== 0) {
          const contractInfo = await getNftContractInfo(address, evmJsonRpc);

          const nfts = await Promise.allSettled(
            tokenIds.map(async (tokenId) => {
              const { tokenURI } = await getNftTokenIdInfo(address, tokenId, walletAddress, evmJsonRpc);

              let nftDisplayInfo = {
                name: '',
                description: '',
                image: '',
                attributes: [],
              };

              try {
                const res = await fetch(normalizeImageSrc(tokenURI, address));
                nftDisplayInfo = await JSON.parse((await res.text()).trim());
              } catch (_) {
                //
              }

              const nftImage = nftDisplayInfo.image ? normalizeImageSrc(nftDisplayInfo.image, address) : tokenURI;

              const nft: OmniflixNft = {
                extension: null,
                collection: {
                  name: contractInfo.name,
                  address,
                  image: nftImage,
                },
                description: nftDisplayInfo.description ?? '',
                name: nftDisplayInfo.name ?? '',
                image: nftImage,
                tokenId,
                tokenUri: tokenURI,
                attributes: nftDisplayInfo.attributes,
              };

              return nft;
            }),
          );

          const allFulfilldNfts = nfts.reduce((acc: OmniflixNft[], nft) => {
            if (nft.status === 'fulfilled') {
              acc.push(nft.value);
            }

            return acc;
          }, []);

          setIsLoading((prevValue) => ({ ...prevValue, [index]: false }));
          if (allFulfilldNfts.length === 0) return;

          setCollectionData((prevValue) => {
            const _collections = (prevValue?.collections ?? []).filter((collection) => collection.address !== address);
            const prevNfts = prevValue?.nfts ?? {};

            const prevChainNfts = prevNfts[chain] ?? [];
            const newCollection = {
              name: contractInfo.name,
              address,
              image: allFulfilldNfts[0].image,
              totalNfts: allFulfilldNfts.length,
              chain,
            };

            const newNfts = allFulfilldNfts.filter((nft) => {
              return prevChainNfts.every((prevChainNft) => prevChainNft.tokenId !== nft.tokenId);
            }) as unknown as OwnedCollectionTokenInfo[];

            return {
              ...prevValue,
              collections: [..._collections, newCollection],
              nfts: {
                ...prevNfts,
                [chain]: [...prevChainNfts, ...newNfts],
              },
            };
          });
        } else {
          setIsLoading((prevValue) => ({ ...prevValue, [index]: false }));
        }
      });
    } else if (nftContractsListStatus === 'error') {
      setIsLoading((prevValue) => ({ ...prevValue, [index]: false }));
    } else {
      setIsLoading((prevValue) => ({ ...prevValue, [index]: true }));
    }
  }, [
    nftContractsListStatus,
    nftContractsList,
    betaEvmNftTokenIds,
    nftChains.length,
    index,
    evmJsonRpc,
    walletAddress,
    chain,
  ]);
}
