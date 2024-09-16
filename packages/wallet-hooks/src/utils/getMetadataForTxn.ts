import { addressPrefixes, getBlockChainFromAddress, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { VoteOption } from 'cosmjs-types/cosmos/gov/v1beta1/gov';

import { LeapWalletApi } from '../apis';
import { getTxLogCosmosBlockchainMapStoreSnapshot, useTxMetadataStore } from '../store';

/************* Send *************/

export async function getMetaDataForIbcTx(
  sourceChannel: string | undefined,
  toAddress: string,
  token: { amount: string; denom: string },
  provider?: string,
  hops?: number,
) {
  const txLogMap = await getTxLogCosmosBlockchainMapStoreSnapshot();
  const prefix = getBlockChainFromAddress(toAddress);
  const _chain = addressPrefixes[prefix ?? ''];
  const chain = _chain === 'cosmoshub' ? 'cosmos' : _chain;
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;

  const metadata = {
    ...globalTxMeta,
    toChain: LeapWalletApi.getCosmosNetwork(chain as SupportedChain, txLogMap),
    toAddress: toAddress,
    token,
  };

  sourceChannel && (metadata.sourceChannel = sourceChannel);
  hops && (metadata.hops = hops);
  provider && (metadata.provider = provider);

  return metadata;
}

export function getMetaDataForSendTx(toAddress: string, token: { amount: string; denom: string }) {
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;

  return {
    ...globalTxMeta,
    toAddress,
    token,
  };
}

export function getMetaDataForSecretTokenTransfer(contract: string) {
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;

  return {
    ...globalTxMeta,
    contract,
  };
}

/************* Secret *************/

export function getMetaDataForRedelegateTx(
  fromValidator: string,
  toValidator: string,
  token: { amount: string; denom: string },
) {
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;

  return {
    ...globalTxMeta,
    fromValidator,
    toValidator,
    token,
  };
}

export function getMetaDataForProviderRedelegateTx(
  fromProvider: string,
  toProvider: string,
  token: { amount: string; denom: string },
) {
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;

  return {
    ...globalTxMeta,
    fromProvider,
    toProvider,
    token,
  };
}

export function getMetaDataForDelegateTx(validatorAddress: string, token: { amount: string; denom: string }) {
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;

  return {
    ...globalTxMeta,
    validatorAddress,
    token,
  };
}

export function getMetaDataForClaimRewardsTx(validators: string[], token: { amount: string; denom: string }) {
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;

  return {
    ...globalTxMeta,
    validators,
    token,
  };
}

export function getMetaDataForRestakeTx(grantee: string, type: string[]) {
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;

  return {
    ...globalTxMeta,
    grantee,
    type,
  };
}

/************* Stride Liquid Staking *************/

export function getMetaDataForLsStakeTx(provider: string, creator: string, token: { amount: string; denom: string }) {
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;

  return {
    ...globalTxMeta,
    provider,
    creator,
    token,
  };
}

export function getMetaDataForLsUnstakeTx(
  provider: string,
  hostChain: string,
  amount: string,
  conversionRate: string,
  receiverAddress: string,
  creator: string,
) {
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;

  return {
    ...globalTxMeta,
    provider,
    creator,
    hostChain,
    amount,
    conversionRate,
    receiverAddress,
  };
}

/************* Swap *************/

export function getMetaDataForSwapTx(
  provider: string,
  fromToken: { amount: number; denom: string },
  toToken: { amount: number; denom: string },
) {
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;

  return {
    ...globalTxMeta,
    provider,
    fromToken,
    toToken,
  };
}

/************* IBC Swap *************/

export function getMetaDataForIbcSwapTx(
  msgType: string,
  provider: string,
  hops: number,
  fromChain: string,
  fromToken: { amount: number; denom: string },
  toChain: string,
  toToken: { amount: number; denom: string },
) {
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;

  return {
    ...globalTxMeta,
    msgType,
    provider,
    hops,
    fromChain,
    fromToken,
    toChain,
    toToken,
  };
}

/************* Governance Vote *************/

export function getMetaDataForGovVoteTx(proposalId: string, option: VoteOption) {
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;

  return {
    ...globalTxMeta,
    proposalId,
    option,
  };
}

/************* NFT *************/

export function getMetaDataForNFTSendTx(toAddress: string, token: { tokenId: string; collectionId: string }) {
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;

  return {
    ...globalTxMeta,
    toAddress,
    token,
  };
}

/************* AuthZ *************/

export function getMetaDataForAuthzTx(grantee: string, type: string[]) {
  const globalTxMeta = useTxMetadataStore.getState().txMetadata;

  return {
    ...globalTxMeta,
    grantee,
    type,
  };
}
