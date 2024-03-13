import { sleep } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const PALLET_BASE_URL = 'https://api.pallet.exchange/api';

export function useGetSeiPalletNFTs(seiAddress: string, selectedNetwork: 'mainnet' | 'testnet') {
  return useQuery(['sei-pallet-nfts', seiAddress, selectedNetwork], async () => {
    if (seiAddress) {
      try {
        const urlForNftsInWallet = `${PALLET_BASE_URL}/v1/user/${seiAddress}`;

        const { data } = await axios.get(urlForNftsInWallet, {
          params: {
            network: selectedNetwork,
            include_tokens: true,
            fetch_nfts: true,
          },
          timeout: 10000,
        });

        const uniqueCollections = new Set(
          data.nfts.map((nft: { collection: { contract_address: string } }) => nft.collection.contract_address),
        );

        const fetchAllNftInfoInCollection = async (
          contractAddress: string,
          tokens: any[] = [],
          page = 1,
        ): Promise<any[]> => {
          await sleep((page - 1) * 1000);
          const urlForNftInfoInCollection = `${PALLET_BASE_URL}/v2/nfts/${contractAddress}/tokens`;

          const {
            data: { tokens: _tokens, count, symbol },
          } = await axios.get(urlForNftInfoInCollection, {
            params: {
              owner: seiAddress,
              page,
              page_size: 1000,
            },
            timeout: 10000,
          });

          tokens = [...tokens, ..._tokens.map((_token: any) => ({ ..._token, collection: { symbol } }))];

          if (count > tokens.length) {
            return fetchAllNftInfoInCollection(contractAddress, tokens, page + 1);
          }
          return tokens;
        };

        const getCollectionsNftsAndDetails = async (contractAddress: string, index: number) => {
          await sleep(index * 1000);
          return fetchAllNftInfoInCollection(contractAddress as string);
        };

        const response = await Promise.allSettled(
          [...uniqueCollections].map(async (contractAddress, index) => {
            return await getCollectionsNftsAndDetails(contractAddress as string, index);
          }),
        );

        const palletNfts = response.reduce((acc: any, curr: any) => {
          if (curr.status !== 'fulfilled') {
            return acc;
          }
          const nfts = curr.value;

          return [
            ...acc,
            ...nfts.map((nft: any) => {
              return {
                extension: null,
                collection: {
                  name: nft.collection.symbol ?? nft.name ?? '',
                  address: nft.collection_key ?? '',
                  image: nft.image ?? '',
                },
                description: nft.description ?? nft.name ?? '',
                name: nft.name ?? '',
                image: nft.image ?? '',
                tokenId: nft.id ?? '',
                tokenUri: `https://pallet.exchange/collection/${nft.collection_key ?? ''}/${nft.id ?? ''}`,
                attributes: (nft.traits ?? []).map((trait: { type: string; value: string }) => ({
                  trait_type: trait.type,
                  value: trait.value,
                })),
              };
            }),
          ];
        }, []);

        return palletNfts;
      } catch (_) {
        throw 'Pallet API is down. You might not see all your Sei NFTs';
      }
    }
  });
}
