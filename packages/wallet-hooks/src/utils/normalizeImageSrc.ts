export const normalizeImageSrc = (src: string) => {
  return src?.startsWith('ipfs://') ? src.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/') : src;
};
