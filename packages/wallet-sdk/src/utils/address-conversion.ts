import bech32 from 'bech32';
import { Address } from 'ethereumjs-util';

function toHex(array: Uint8Array) {
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function getEthereumAddress(address: string): string {
  if (address.startsWith('0x')) {
    return address;
  }

  return `0x${toHex(Uint8Array.from(bech32.fromWords(bech32.decode(address).words)))}`;
}

export function getBech32Address(prefix: string, address: string): string {
  const addressHex = address.startsWith('0x') ? address : `0x${address}`;
  const addressBuffer = Address.fromString(addressHex).toBuffer();

  return bech32.encode(prefix, bech32.toWords(addressBuffer));
}
