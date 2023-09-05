import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { OmniflixNft } from './types';

export function useGetOmniflixNFTs(
  onmiflixAddress: string,
  selectedNetwork: string,
  options?: { limit?: number; skip?: number },
) {
  const { limit = 9999, skip = 0 } = options ?? {};
  const mainnetUrl = `https://data-api.omniflix.studio/nfts`;
  const testnetUrl = `https://data-layer-f4.omniflix.studio/nfts`;
  const metadataUri = selectedNetwork === 'mainnet' ? mainnetUrl : testnetUrl;

  return useQuery(
    ['omniflix-nfts', onmiflixAddress, selectedNetwork, metadataUri],
    async () => {
      try {
        const { data } = await axios.get(metadataUri, {
          params: {
            skip: skip,
            limit: limit,
            order: 'desc',
            owner: onmiflixAddress,
          },
        });

        return data.result.list.map((nftEntry: any) => {
          const nft: OmniflixNft = {
            extension: null,
            collection: {
              name: nftEntry.denom.name,
              address: nftEntry.denom.id,
              image: nftEntry.denom.preview_uri,
            },
            description: nftEntry.description,
            name: nftEntry.name,
            image: nftEntry.media_uri,
            tokenId: nftEntry.id,
            tokenUri: `https://omniflix.market/nft/${nftEntry.id}`,
            media_type: nftEntry.media_type ?? nftEntry.denom.media_type,
          };

          if (nftEntry.data) {
            nft['attributes'] = Object.entries(JSON.parse(nftEntry.data)).map((attribute) => ({
              trait_type: attribute[0],
              value: attribute[1] as string,
            }));
          }

          return nft;
        });
      } catch (_) {
        //
      }
    },
    { enabled: !!onmiflixAddress },
  );
}
