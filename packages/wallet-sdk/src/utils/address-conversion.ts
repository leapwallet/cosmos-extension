import { fromBase64 } from '@cosmjs/encoding';
import { Secp256k1 } from '@leapwallet/leap-keychain';
import { bech32 } from 'bech32';
import { Address, pubToAddress } from 'ethereumjs-util';

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

export function pubKeyToEvmAddress(decompressedPubKey: Uint8Array): string {
  const address = pubToAddress(Buffer.from(decompressedPubKey), true);
  return `0x${address.toString('hex')}`;
}

export function pubKeyToEvmAddressToShow(pubkey: string | Uint8Array | undefined): string {
  if (pubkey === undefined) return 'Unable to show EVM address';
  const pubKeyBytes = typeof pubkey === 'string' ? fromBase64(pubkey) : pubkey;

  const seiEvmAddress = pubKeyBytes
    ? pubKeyToEvmAddress(Secp256k1.publicKeyConvert(pubKeyBytes, false))
    : 'Unable to show EVM address';

  return seiEvmAddress;
}
