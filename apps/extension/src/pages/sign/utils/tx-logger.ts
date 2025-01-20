/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { AminoSignResponse, encodeSecp256k1Pubkey, StdSignDoc } from '@cosmjs/amino'
import { Secp256k1 } from '@cosmjs/crypto'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import { Int53 } from '@cosmjs/math'
import {
  DirectSignResponse,
  encodePubkey,
  makeAuthInfoBytes,
  Registry,
  TxBodyEncodeObject,
} from '@cosmjs/proto-signing'
import { AminoMsgTransfer, AminoTypes } from '@cosmjs/stargate'
import { CosmosTxType, LeapWalletApi } from '@leapwallet/cosmos-wallet-hooks'
import {
  getEip712TxHash,
  getMsgFromAmino,
  getTxHashFromSignedTx,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import {
  initiaAminoConverters,
  initiaProtoRegistry,
} from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/initia/client'
import {
  createTransaction,
  SIGN_AMINO,
} from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/injective/core/modules'
import {
  cosmosAminoConverters,
  cosmosProtoRegistry,
  cosmwasmAminoConverters,
  cosmwasmProtoRegistry,
  ibcAminoConverters as originalIbcAminoConverters,
  ibcProtoRegistry,
  osmosisAminoConverters as originalOsmosisAminoConverters,
  osmosisProtoRegistry,
} from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/osmosis'
import { strideAminoConverters } from '@leapwallet/cosmos-wallet-sdk/dist/browser/proto/stride/client'
import { LEAPBOARD_URL, LEAPBOARD_URL_OLD } from 'config/constants'
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import Long from 'long'

const osmosisAminoConverters: Record<
  keyof typeof originalOsmosisAminoConverters,
  {
    aminoType: string
    toAmino: (msg: any) => any
    fromAmino: (msg: any) => any
  }
> = {
  ...originalOsmosisAminoConverters,
  //@ts-ignore
  '/osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1.MsgCreateConcentratedPool': {
    //@ts-ignore
    ...originalOsmosisAminoConverters[
      '/osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1.MsgCreateConcentratedPool'
    ],
    aminoType: 'osmosis/cl-create-pool',
  },
  '/osmosis.valsetpref.v1beta1.MsgDelegateToValidatorSet': {
    //@ts-ignore
    ...originalOsmosisAminoConverters['/osmosis.valsetpref.v1beta1.MsgDelegateToValidatorSet'],
    aminoType: 'osmosis/MsgDelegateToValidatorSet',
  },
  '/osmosis.valsetpref.v1beta1.MsgUndelegateFromValidatorSet': {
    //@ts-ignore
    ...originalOsmosisAminoConverters['/osmosis.valsetpref.v1beta1.MsgUndelegateFromValidatorSet'],
    aminoType: 'osmosis/MsgUndelegateFromValidatorSet',
  },
}

const ibcAminoConverters: Record<
  keyof typeof originalIbcAminoConverters,
  {
    aminoType: string
    toAmino: (msg: any) => any
    fromAmino: (msg: any) => any
  }
> = {
  ...originalIbcAminoConverters,
  '/ibc.applications.transfer.v1.MsgTransfer': {
    ...originalIbcAminoConverters['/ibc.applications.transfer.v1.MsgTransfer'],
    // Remove timeout_timestamp as it is not used by our transactions.
    toAmino: ({
      sourcePort,
      sourceChannel,
      token,
      sender,
      receiver,
      timeoutHeight,
    }: MsgTransfer) => ({
      source_port: sourcePort,
      source_channel: sourceChannel,
      token: {
        denom: token?.denom,
        amount: token?.amount ?? '0',
      },
      sender,
      receiver,
      timeout_height: timeoutHeight
        ? {
            revision_height: timeoutHeight.revisionHeight?.toString(),
            revision_number: timeoutHeight.revisionNumber?.toString(),
          }
        : {},
    }),
    fromAmino: ({
      source_port,
      source_channel,
      token,
      sender,
      receiver,
      timeout_height,
      timeout_timestamp,
      //@ts-ignore
      memo = '',
    }: AminoMsgTransfer['value']): MsgTransfer => {
      return {
        memo,
        sourcePort: source_port,
        sourceChannel: source_channel,
        token: {
          denom: token?.denom ?? '',
          amount: token?.amount ?? '',
        },
        sender,
        receiver,
        timeoutHeight: timeout_height
          ? {
              revisionHeight: Long.fromString(timeout_height.revision_height || '0', true),
              revisionNumber: Long.fromString(timeout_height.revision_number || '0', true),
            }
          : undefined,
        timeoutTimestamp: Long.fromString(timeout_timestamp ?? '0'),
      }
    },
  },
}

const aminoTypes = new AminoTypes({
  ...cosmosAminoConverters,
  ...ibcAminoConverters,
  ...osmosisAminoConverters,
  ...cosmwasmAminoConverters,
  ...strideAminoConverters,
  ...initiaAminoConverters,
})

const registry = new Registry([
  ...cosmosProtoRegistry,
  ...osmosisProtoRegistry,
  ...cosmwasmProtoRegistry,
  ...ibcProtoRegistry,
  ...initiaProtoRegistry,
])

import LogCosmosDappTx = LeapWalletApi.LogCosmosDappTx

const DAPPS_TO_SKIP_TXN_LOGGING = [LEAPBOARD_URL, LEAPBOARD_URL_OLD, 'swapfast.app']

function shouldSkipTxnLogging(origin: string): boolean {
  return DAPPS_TO_SKIP_TXN_LOGGING.some((dapp) => origin.trim().toLowerCase().includes(dapp))
}

export function getTxHashFromDirectSignResponse(data: DirectSignResponse): string {
  const txHash = getTxHashFromSignedTx({
    authInfoBytes: data.signed.authInfoBytes,
    bodyBytes: data.signed.bodyBytes,
    signatures: [fromBase64(data.signature.signature)],
  })

  return txHash
}

export async function logDirectTx(
  data: DirectSignResponse,
  messages: any[],
  origin: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fee: any,
  chain: SupportedChain,
  address: string,
  txPostToDb: LogCosmosDappTx,
  chainId: string,
  selectedNetwork: 'mainnet' | 'testnet',
) {
  if (shouldSkipTxnLogging(origin)) {
    return
  }

  const txHash = getTxHashFromDirectSignResponse(data)

  await txPostToDb({
    txHash,
    txType: CosmosTxType.Dapp,
    metadata: {
      dapp_url: origin,
      tx_message: messages.map((message) => {
        return message?.parsed ?? message
      }),
    },
    feeQuantity: fee?.amount[0]?.amount,
    feeDenomination: fee?.amount[0]?.denom,
    chain,
    chainId,
    address,
    network: selectedNetwork,
  })
}

/**
 * Converts amino JSON data into direct signed data and signs the bytes. Returns the tx hash.
 * This will throw an error if the message type is not in the registry.
 */
export function getTxHashFromAminoSignResponse(
  data: AminoSignResponse,
  pubkey: Uint8Array,
): string {
  const signedTxBody = {
    messages: data.signed.msgs.map((msg) => aminoTypes.fromAmino(msg)),
    memo: data.signed.memo,
    //@ts-ignore
    timeoutHeight: data.signed.timeout_height,
  }

  const signedTxBodyEncodeObject: TxBodyEncodeObject = {
    typeUrl: '/cosmos.tx.v1beta1.TxBody',
    value: signedTxBody,
  }

  const signedTxBodyBytes = registry.encode(signedTxBodyEncodeObject)
  const signedGasLimit = Int53.fromString(data.signed.fee.gas).toNumber()
  const signedSequence = Int53.fromString(data.signed.sequence).toNumber()
  const encodedPubKey = encodePubkey(encodeSecp256k1Pubkey(pubkey))

  const signedAuthInfoBytes = makeAuthInfoBytes(
    [{ pubkey: encodedPubKey, sequence: signedSequence }],
    data.signed.fee.amount,
    signedGasLimit,
    data.signed.fee.granter,
    data.signed.fee.payer,
    SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
  )

  const txHash = getTxHashFromSignedTx({
    authInfoBytes: signedAuthInfoBytes,
    bodyBytes: signedTxBodyBytes,
    signatures: [fromBase64(data.signature.signature)],
  })

  return txHash
}

export async function logSignAmino(
  data: AminoSignResponse,
  pubkey: Uint8Array,
  txPostToDb: LogCosmosDappTx,
  chain: SupportedChain,
  address: string,
  origin: string,
  selectedNetwork: 'mainnet' | 'testnet',
) {
  if (shouldSkipTxnLogging(origin)) {
    return
  }

  if (data.signed.msgs.find((msg) => msg.type === 'query_permit')) return
  const txHash = getTxHashFromAminoSignResponse(data, pubkey)

  await txPostToDb({
    txHash,
    txType: CosmosTxType.Dapp,
    metadata: {
      dapp_url: origin,
      tx_message: data.signed.msgs,
    },
    feeQuantity: data.signed.fee?.amount[0]?.amount,
    feeDenomination: data.signed.fee?.amount[0]?.denom,
    chain,
    chainId: data.signed.chain_id,
    address,
    network: selectedNetwork,
  })
}

export async function logSignAminoInj(
  data: AminoSignResponse,
  pubkey: Uint8Array,
  txPostToDb: LogCosmosDappTx,
  evmChainId: string,
  chain: SupportedChain,
  address: string,
  origin: string,
  selectedNetwork: 'mainnet' | 'testnet',
) {
  if (shouldSkipTxnLogging(origin)) {
    return
  }
  const _signDoc = data.signed as StdSignDoc & { timeout_height: string }
  const pubKey = toBase64(Secp256k1.compressPubkey(pubkey))
  const arg = {
    message: getMsgFromAmino(_signDoc.msgs as any),
    memo: _signDoc.memo,
    signMode: SIGN_AMINO,
    pubKey,
    timeoutHeight: parseInt(_signDoc.timeout_height, 10),
    sequence: parseInt(_signDoc.sequence, 10),
    accountNumber: parseInt(_signDoc.account_number, 10),
    chainId: _signDoc.chain_id,
    fee: _signDoc.fee,
  }
  const { txRaw } = createTransaction(arg)
  const txHash = getEip712TxHash({
    signature: data.signature.signature,
    ethereumChainId: parseInt(evmChainId ?? '1'),
    txRaw,
  })

  await txPostToDb({
    txHash,
    txType: CosmosTxType.Dapp,
    metadata: {
      dapp_url: origin,
      tx_message: data.signed.msgs,
    },
    feeQuantity: data.signed.fee?.amount[0]?.amount,
    feeDenomination: data.signed.fee?.amount[0]?.denom,
    chain,
    chainId: data.signed.chain_id,
    address,
    network: selectedNetwork,
  })
}
