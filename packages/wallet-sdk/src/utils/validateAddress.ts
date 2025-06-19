import { AccountAddress } from '@aptos-labs/ts-sdk';
import { BtcAddress, NETWORK, TEST_NETWORK } from '@leapwallet/leap-keychain';
import { bech32 } from 'bech32';
import { isValidAddress as isValidEthAddress } from 'ethereumjs-util';
import * as sol from 'micro-sol-signer';
import { NetworkType } from 'tx';

export function getBlockChainFromAddress(address: string): string | undefined {
  if (address.startsWith('tb1q')) {
    return 'tb1q';
  }
  if (address.startsWith('bc1q')) {
    return 'bc1q';
  }
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

export function isValidBtcAddress(address: string, network: NetworkType) {
  try {
    BtcAddress(network === 'mainnet' ? NETWORK : TEST_NETWORK).decode(address);
    return true;
  } catch (e) {
    return false;
  }
}

export function isValidAddress(address: string): boolean {
  if (address.startsWith('tb1q')) {
    return isValidBtcAddress(address, 'testnet');
  }
  if (address.startsWith('bc1q')) {
    return isValidBtcAddress(address, 'mainnet');
  }
  const chainPrefix = getBlockChainFromAddress(address);
  return !!chainPrefix && isValidAddressWithPrefix(address, chainPrefix);
}

export function isEthAddress(address: string): boolean {
  return isValidEthAddress(address);
}

export function isValidWalletAddress(address: string): boolean {
  return isValidAddress(address) || isValidEthAddress(address);
}

export function isAptosAddress(address: string): boolean {
  return AccountAddress.isValid({ input: address, strict: true }).valid;
}

export function isSolanaAddress(address: string): boolean {
  try {
    sol.validateAddress(address);
    return true;
  } catch (e) {
    return false;
  }
}
