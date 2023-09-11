import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { OmniflixNft } from './types';

export function useGetStargazeNFTs(stargazeAddress: string, selectedNetwork: string) {
  const testnetUrl = `https://nft-api.elgafar-1.stargaze-apis.com/api/v1beta/profile/${stargazeAddress}/nfts`;
  const mainnetUrl = `https://nft-api.stargaze-apis.com/api/v1beta/profile/${stargazeAddress}/nfts`;
  const metadataUri = selectedNetwork === 'mainnet' ? mainnetUrl : testnetUrl;

  return useQuery(
    ['stargaze-nfts', stargazeAddress, selectedNetwork, metadataUri],
    async () => {
      try {
        if (selectedNetwork === 'mainnet') {
          const TOKENS_QUERY = `
        {
          tokens(owner: "${stargazeAddress}", limit: 99999) {
            tokens {
              id
              tokenId
              collection {
                contractAddress
                name
                media {
                  url
                  type
                }
              }
              name
              media {
                type
                url
                format
              }
              description
              tokenUri
              traits {
                name
                value
              }
            }
          }
        }
        `;

          const {
            data: {
              data: {
                tokens: { tokens },
              },
            },
          } = await axios({
            url: 'https://graphql.mainnet.stargaze-apis.com/graphql',
            method: 'POST',
            data: {
              query: TOKENS_QUERY,
            },
          });

          return tokens.map((nftEntry: any) => {
            const nft: OmniflixNft = {
              extension: null,
              collection: {
                name: nftEntry.collection.name ?? '',
                address: nftEntry.collection.contractAddress ?? '',
                image: nftEntry.collection.media.url ?? '',
              },
              description: nftEntry.description ?? '',
              name: nftEntry.name ?? '',
              image: nftEntry.media.url ?? '',
              tokenId: nftEntry.tokenId ?? '',
              tokenUri: `https://www.stargaze.zone/marketplace/${nftEntry.id ?? ''}`,
            };

            if (nftEntry.traits) {
              nft['attributes'] = nftEntry.traits.map((trait: any) => ({ trait_type: trait.name, value: trait.value }));
            }

            return nft;
          });
        } else {
          const { data } = await axios.get(metadataUri);

          return Promise.all(
            data.map(async (nftEntry: any) => {
              const nft: OmniflixNft = {
                extension: null,
                collection: {
                  name: nftEntry.collection.name,
                  address: nftEntry.collection.contractAddress,
                  image: nftEntry.collection.image,
                },
                description: nftEntry.description,
                name: nftEntry.name,
                image: nftEntry.image,
                tokenId: nftEntry.tokenId,
                tokenUri: `https://www.stargaze.zone/marketplace/${nftEntry.collection.contractAddress}/${nftEntry.tokenId}`,
              };

              try {
                const { data } = await axios.get(
                  nftEntry.tokenUri.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/'),
                );

                if (data.attributes) {
                  nft['attributes'] = data.attributes;
                }
              } catch (_) {
                //
              }

              return nft;
            }),
          );
        }
      } catch (_) {
        //
      }
    },
    { enabled: !!stargazeAddress },
  );
}
