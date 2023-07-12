import { Secp256k1Wallet } from '@cosmjs/amino';
import { Slip10, Slip10Curve, stringToPath } from '@cosmjs/crypto';
import { fromHex, toHex } from '@cosmjs/encoding';
import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet, OfflineDirectSigner } from '@cosmjs/proto-signing';
import { EthWallet, generateWallet } from '@leapwallet/leap-keychain';
import * as bip39 from 'bip39';

import getHDPath from '../utils/get-hdpath';
import { DirectEthSecp256k1HdWallet } from './DirectEthSecp256k1HdWallet';

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
  return toHex(res.privkey);
}

/**
 *
 * @param {number} strength - mnemonic word length
 * @returns {Promise<DirectSecp256k1HdWallet>}
 */
export async function generateNewWallet(strength: 12 | 24 = 24) {
  return DirectSecp256k1HdWallet.generate(strength);
}

/**
 *
 * @param mnemonic
 * @param hdPath
 * @param prefix
 *
 * @param isAmino
 * @returns {Promise<DirectSecp256k1HdWallet>}
 */
export async function generateWalletFromMnemonic(
  mnemonic: string,
  hdPath: string,
  prefix: string,
): Promise<OfflineDirectSigner> {
  const hdPathParams = hdPath.split('/');
  const coinType = hdPathParams[2];

  if (coinType.replace("'", '') === '60') {
    return new Promise((resolve) =>
      resolve(
        EthWallet.generateWalletFromMnemonic(mnemonic, {
          paths: [hdPath],
          addressPrefix: prefix,
        }) as unknown as OfflineDirectSigner,
      ),
    );
  }

  return new Promise((resolve) =>
    resolve(generateWallet(mnemonic, { paths: [hdPath], addressPrefix: prefix }) as unknown as OfflineDirectSigner),
  );
}

/**
 *
 * @param key
 * @param prefix
 * @param isAmino
 * @returns {Promise<DirectSecp256k1HdWallet>}
 */
export async function generateWalletFromPrivateKey(key: string, prefix = 'cosmos', isAmino?: boolean) {
  const privateKey = key.startsWith('0x') || key.startsWith('0X') ? key.slice(2) : key;
  if (prefix === 'inj' || prefix === 'evmos') {
    // hd path is passed here for completeness but is not used
    return new DirectEthSecp256k1HdWallet('', key, 'pvtKey', { hdPaths: [getHDPath('60', '1')], prefix });
  }
  if (!isAmino) {
    return DirectSecp256k1Wallet.fromKey(fromHex(privateKey), prefix);
  } else {
    return Secp256k1Wallet.fromKey(fromHex(privateKey), prefix);
  }
}
