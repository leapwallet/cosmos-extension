import CryptoJS from 'crypto-js';
import * as secp256k1 from 'secp256k1';

export const hashToHex = (data: string): string => {
  return CryptoJS.SHA256(CryptoJS.enc.Base64.parse(data)).toString().toUpperCase();
};
export function uint8ArrayToHex(arr: Uint8Array) {
  return Buffer.from(arr).toString('hex');
}

export function hexToUnit8Array(str: string) {
  return new Uint8Array(Buffer.from(str, 'hex'));
}

export function decompressPubKey(startsWith02Or03: string) {
  // if already decompressed an not has trailing 04
  const testBuffer = Buffer.from(startsWith02Or03, 'hex');

  if (testBuffer.length === 64) startsWith02Or03 = '04' + startsWith02Or03;

  let decompressed = uint8ArrayToHex(secp256k1.publicKeyConvert(hexToUnit8Array(startsWith02Or03), false));

  // remove trailing 04
  decompressed = decompressed.substring(2);

  return decompressed;
}
