import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { OmniflixNft } from './types';

export function useGetAuraNFTs(walletAddress: string, selectedNetwork: 'mainnet' | 'testnet') {
  return useQuery(['query-get-aura-nfts', walletAddress, selectedNetwork], async function () {
    if (selectedNetwork === 'mainnet') {
      const fetchNfts = async (start_after = 0, nfts: any[] = []): Promise<any[]> => {
        try {
          const {
            data: {
              data: {
                xstaxy: { cw721_token: _nfts },
              },
            },
          } = await axios({
            url: 'https://horoscope.aura.network/api/v2/graphql',
            method: 'POST',
            data: {
              operationName: 'cw721token',
              query: `
                query cw721token($owner: String = null, $limit: Int = 10, $offset: Int = null) { 
                    xstaxy {
                        cw721_token(limit: $limit, offset: $offset, where: {owner: {_eq: $owner} }) {
                            media_info
                            token_id
                            cw721_contract {
                              name
                              smart_contract {
                                address
                              }
                            }
                        }
                    }
                }
              `,
              variables: {
                owner: walletAddress,
                offset: start_after,
                limit: 50,
              },
            },
          });

          nfts = [...nfts, ..._nfts];
          if (_nfts.length === 50) {
            return fetchNfts(nfts.length, nfts);
          }

          return nfts;
        } catch (_) {
          return [];
        }
      };

      const nfts = await fetchNfts();

      return nfts.map((nftEntry) => {
        const nft: OmniflixNft = {
          extension: null,
          collection: {
            name: nftEntry?.cw721_contract?.name ?? '',
            address: nftEntry?.cw721_contract?.smart_contract?.address ?? '',
            image: '',
          },
          description: nftEntry?.media_info?.onchain?.metadata?.description ?? '',
          name: nftEntry?.media_info?.onchain?.metadata?.name ?? '',
          image: nftEntry?.media_info?.onchain?.metadata?.image ?? '',
          tokenId: nftEntry?.token_id ?? '',
          tokenUri: nftEntry?.media_info?.onchain?.token_uri ?? '',
          attributes: nftEntry?.media_info?.onchain?.metadata?.attributes,
        };

        return nft;
      });
    } else {
      return [];
    }
  });
}
