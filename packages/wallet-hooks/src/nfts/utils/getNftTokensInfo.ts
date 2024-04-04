import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';

import { NFTInfo, NFTInfoWithTokenId } from '../types';
import { getIsFractionalizedNft, getNftInfoQuery } from './index';

export type GetNftTokensInfoParams = {
  client: CosmWasmClient;
  tokenId: string;
  collectionAddress: string;
  iteratedUriNftContracts: string[];
  walletAddress: string;
};

export async function getNftTokensInfo({
  client,
  tokenId,
  collectionAddress,
  iteratedUriNftContracts,
  walletAddress,
}: GetNftTokensInfoParams): Promise<NFTInfoWithTokenId | undefined> {
  try {
    const query = await getNftInfoQuery(tokenId, collectionAddress);
    const nftInfo: NFTInfo = await client.queryContractSmart(collectionAddress, query);

    if (await getIsFractionalizedNft(collectionAddress)) {
      const investor = nftInfo.investors?.find((investor) => investor.address === walletAddress);

      if (!investor) {
        throw new Error('Investor not found');
      }

      return {
        tokenUri: nftInfo.token_uri,
        extension: { ...(nftInfo.extension ?? {}), allocations: investor.allocations },
        tokenId: tokenId,
      };
    }

    if (iteratedUriNftContracts.includes(collectionAddress)) {
      return {
        tokenUri: `${nftInfo.token_uri ?? ''}/${tokenId}`,
        extension: nftInfo.extension,
        tokenId: tokenId ?? '',
      };
    }

    return {
      tokenUri: nftInfo.token_uri ?? '',
      extension: nftInfo.extension,
      tokenId: tokenId ?? '',
    };
  } catch (_) {
    //
  }
}
