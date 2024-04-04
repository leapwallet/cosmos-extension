import { NftQuery } from '../types';
import { getIsFractionalizedNft } from './index';

export type GetTokensQueryParams = {
  walletAddress: string;
  limit: number;
  startAfter?: string;
  collectionAddress?: string;
};

export async function getTokensQuery({
  walletAddress,
  limit,
  startAfter,
  collectionAddress,
}: GetTokensQueryParams): Promise<NftQuery> {
  if (await getIsFractionalizedNft(collectionAddress ?? '')) {
    return { all_tokens: {} };
  }

  return { tokens: { owner: walletAddress, limit, start_after: startAfter } };
}
