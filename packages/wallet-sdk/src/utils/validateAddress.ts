import { bech32 } from 'bech32';
import { isValidAddress as isValidEthAddress } from 'ethereumjs-util';
export function getBlockChainFromAddress(address: string): string | undefined {
  try {
    const words = bech32.decode(address);
    return words.prefix as string;
  } catch (error) {
    return undefined;
  }
}

function isBech32(value: string, prefix: string): boolean {
  try {
    const words = bech32.decode(value);
    return words.prefix === prefix;
  } catch (error) {
    return false;
  }
}

/**
 *
 * @param {string} address - address to test
 * @param {string} blockchainPrefix - blockchain prefix e.g 'terra', 'osmo', 'one',  etc
 * @returns {boolean} - true/false
 */
export function isValidAddressWithPrefix(address: string, blockchainPrefix: string): boolean {
  const validAddressLengths = [39, 59];
  const validAddressLength = validAddressLengths.includes(address.replace(blockchainPrefix, '').length);
  return validAddressLength && address.startsWith(blockchainPrefix) && isBech32(address, blockchainPrefix);
}

export function isValidAddress(address: string): boolean {
  const chainPrefix = getBlockChainFromAddress(address);
  return !!chainPrefix && isValidAddressWithPrefix(address, chainPrefix);
}

export function isEthAddress(address: string): boolean {
  return isValidEthAddress(address);
}
