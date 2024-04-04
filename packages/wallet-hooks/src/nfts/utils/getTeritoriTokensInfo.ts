import { OwnedCollectionTokenInfo } from '../types';
import { GetNonTeritoriTokensInfoParams } from './index';

export function getTeritoriTokensInfo({
  tokensInfo,
  collection,
}: GetNonTeritoriTokensInfoParams): OwnedCollectionTokenInfo | undefined {
  if (!tokensInfo) {
    return;
  }

  const { tokenId, extension } = tokensInfo;

  if (extension.public_name && tokenId.includes('.')) {
    return {
      name: (extension.public_name ?? '') as string,
      domain: tokenId ?? '',
      collection,
      extension,
    };
  }

  return {
    extension,
    collection,
    name: (extension.name ?? '') as string,
    image: (extension.image ?? '') as string,
    tokenId,
    tokenUri: `https://app.teritori.com/nft/tori-${collection.contractAddress}-${tokenId}`,
  };
}
