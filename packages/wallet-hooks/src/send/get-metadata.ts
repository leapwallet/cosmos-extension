import { addressPrefixes, getBlockChainFromAddress, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

import { LeapWalletApi } from '../apis/LeapWalletApi';

export function getMetaDataForIbcTx(
  sourceChannel: string,
  toAddress: string,
  token: { amount: string; denom: string },
) {
  const prefix = getBlockChainFromAddress(toAddress);
  const _chain = addressPrefixes[prefix ?? ''];
  const chain = _chain === 'cosmoshub' ? 'cosmos' : _chain;

  return {
    sourceChannel,
    toChain: LeapWalletApi.getCosmosNetwork(chain as SupportedChain),
    toAddress: toAddress,
    token,
  };
}

export function getMetaDataForSendTx(toAddress: string, token: { amount: string; denom: string }) {
  return {
    toAddress,
    token,
  };
}
