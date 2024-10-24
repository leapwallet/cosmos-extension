import { isSakeInuNftCollection } from '@leapwallet/cosmos-wallet-store/dist/utils'

export const normalizeImageSrc = (src: string, collection?: string) => {
  if (isSakeInuNftCollection(collection ?? '')) {
    return src?.startsWith('ipfs://')
      ? src.replace('ipfs://', 'https://sakeinu.mypinata.cloud/ipfs/')
      : src
  }

  return src?.startsWith('ipfs://') ? src.replace('ipfs://', 'https://ipfs.io/ipfs/') : src
}
