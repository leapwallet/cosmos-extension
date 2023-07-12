import { stringToPath } from '@cosmjs/crypto';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';

import getHDPath from '../src/utils/get-hdpath';
import constants from './constants';

const { MNEMONIC12 } = constants;

export async function getWallet(prefix: string, mnemonic = MNEMONIC12) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    hdPaths: [stringToPath(getHDPath('118'))],
    prefix,
  });
  return wallet;
}
