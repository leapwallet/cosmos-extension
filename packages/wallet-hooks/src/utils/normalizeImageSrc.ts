import { isStakeInuNftCollection } from './is-stakeinu-nft-collection';

export const normalizeImageSrc = (src: string, collection?: string) => {
  if (isStakeInuNftCollection(collection ?? '')) {
    return src?.startsWith('ipfs://') ? src.replace('ipfs://', 'https://sakeinu.mypinata.cloud/ipfs/') : src;
  }

  return src?.startsWith('ipfs://') ? src.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/') : src;
};
