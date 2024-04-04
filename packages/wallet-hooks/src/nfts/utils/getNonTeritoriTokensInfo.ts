import {
  CollectionInfo,
  FractionalizedNftInformation,
  NFTDisplayInformation,
  NFTInfoWithTokenId,
  OwnedCollectionOptions,
  OwnedCollectionTokenInfo,
} from '../types';
import { getIsFractionalizedNft } from './index';

export type GetNonTeritoriTokensInfoParams = {
  tokensInfo: NFTInfoWithTokenId | null;
  collection: CollectionInfo;
  options?: OwnedCollectionOptions;
};

export async function getNonTeritoriTokensInfo({
  tokensInfo,
  collection,
  options,
}: GetNonTeritoriTokensInfoParams): Promise<OwnedCollectionTokenInfo | undefined> {
  if (!tokensInfo) {
    return;
  }

  const { tokenId, extension } = tokensInfo;
  let { tokenUri } = tokensInfo;
  try {
    const res = await fetch(options?.tokenUriModifier?.(tokenUri) ?? tokenUri);

    /**
     * The below fix is to fetch details properly on android, the request was
     * made but when we do res.json(), it results into a parse error. Due to
     * some object structure
     */
    let nftDisplayInfo: NFTDisplayInformation = await JSON.parse((await res.text()).trim());

    if (await getIsFractionalizedNft(collection.contractAddress)) {
      const _nftDisplayInfo = nftDisplayInfo as unknown as FractionalizedNftInformation;
      tokenUri = 'https://codedestate.com/landing';

      nftDisplayInfo = {
        ...nftDisplayInfo,
        name: _nftDisplayInfo['Tower Name'],
        image: _nftDisplayInfo.Images[0],
      };
    }

    /**
     * for one of the collection on Sei, we get name and image in properties
     * property
     */
    if ([nftDisplayInfo.name, nftDisplayInfo.image].includes(undefined!) && nftDisplayInfo?.properties) {
      nftDisplayInfo = {
        name: nftDisplayInfo.properties?.name?.description ?? '',
        image: nftDisplayInfo.properties?.image?.description ?? '',
      };
    }

    /**
     * for Zen on Injective, we get NFT Image in media property
     */
    if ([nftDisplayInfo.name, nftDisplayInfo.image].includes(undefined!) && nftDisplayInfo?.media) {
      nftDisplayInfo = {
        image: nftDisplayInfo.media ?? '',
        name: nftDisplayInfo.title ?? nftDisplayInfo.name ?? '',
      };
    }

    return {
      ...nftDisplayInfo,
      tokenUri,
      tokenId,
      collection,
      extension,
    };
  } catch (_) {
    //
  }

  /**
   * For domain name nfts
   */
  if (extension && extension.name && extension.domain) {
    return {
      name: (extension.name ?? '') as string,
      domain: (extension.domain ?? '') as string,
      collection,
      extension,
    };
  }
}
