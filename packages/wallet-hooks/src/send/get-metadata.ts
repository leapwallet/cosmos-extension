import { addressPrefixes, getBlockChainFromAddress, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

import { LeapWalletApi } from '../apis/LeapWalletApi';
import { useTxMetadataStore } from '../store';

export function getMetaDataForIbcTx(
  sourceChannel: string,
  toAddress: string,
  token: { amount: string; denom: string },
) {
  const prefix = getBlockChainFromAddress(toAddress);
  const _chain = addressPrefixes[prefix ?? ''];
  const chain = _chain === 'cosmoshub' ? 'cosmos' : _chain;
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;

  return {
    sourceChannel,
    toChain: LeapWalletApi.getCosmosNetwork(chain as SupportedChain),
    toAddress: toAddress,
    token,
    ...globalTxMeta,
  };
}

export function getMetaDataForSendTx(toAddress: string, token: { amount: string; denom: string }) {
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;
  return {
    toAddress,
    token,
    ...globalTxMeta,
  };
}
