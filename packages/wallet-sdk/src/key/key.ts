import { Slip10, Slip10Curve, stringToPath } from '@cosmjs/crypto';
import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from '@cosmjs/proto-signing';
import { BtcWalletHD, NETWORK } from '@leapwallet/leap-keychain';
import { hex } from '@scure/base';
import * as bip39 from 'bip39';

import { ChainInfos } from '../constants';

export { DirectSecp256k1HdWallet, DirectSecp256k1Wallet };
/**
 * create a new mnemonic
 *
 * @param {(12 | 24)} [numberOfWords=24] - default length of a mnemonic is 24
 * @returns {string} - new mnemonic or given length
 */
export function createMnemonic(numberOfWords: 12 | 24 = 24): string {
  if (numberOfWords === 12) return bip39.generateMnemonic(128);
  return bip39.generateMnemonic(256);
}

/**
 * create a new mnemonic
 *
 * @param mnemonic
 * @param hdPath
 * @returns {string} - privKey from mnemonic and HdPath
 */
export async function generatePrivateKeyFromHdPath(mnemonic: string, hdPath: string): Promise<string> {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const res = Slip10.derivePath(Slip10Curve.Secp256k1, seed, stringToPath(hdPath));
  return hex.encode(res.privkey);
}

export function generateBitcoinPrivateKey(mnemonic: string, hdPath: string) {
  const btcWallet = BtcWalletHD.generateWalletFromMnemonic(mnemonic, {
    addressPrefix: ChainInfos.bitcoin.addressPrefix,
    paths: [hdPath],
    network: NETWORK,
  });
  const privKey = btcWallet.getAccountsWithPrivKey()[0].privateKey;
  return hex.encode(privKey);
}

/**
 *
 * @param {number} strength - mnemonic word length
 * @returns {Promise<DirectSecp256k1HdWallet>}
 */
export async function generateNewWallet(strength: 12 | 24 = 24) {
  return DirectSecp256k1HdWallet.generate(strength);
}
