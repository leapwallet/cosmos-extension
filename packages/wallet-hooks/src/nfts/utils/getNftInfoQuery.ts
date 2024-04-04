import { NftQuery } from '../types';
import { getIsFractionalizedNft } from './index';

export async function getNftInfoQuery(tokenId: string, collectionAddress: string): Promise<NftQuery> {
  if (await getIsFractionalizedNft(collectionAddress ?? '')) {
    return { all_nft_info: { token_id: tokenId } };
  }

  return { nft_info: { token_id: tokenId } };
}
