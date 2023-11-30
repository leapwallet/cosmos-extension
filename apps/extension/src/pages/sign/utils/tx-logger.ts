import { AminoSignResponse, encodeSecp256k1Pubkey } from '@cosmjs/amino'
import { fromBase64 } from '@cosmjs/encoding'
import { Int53 } from '@cosmjs/math'
import {
  DirectSignResponse,
  encodePubkey,
  makeAuthInfoBytes,
  Registry,
  TxBodyEncodeObject,
} from '@cosmjs/proto-signing'
import { AminoTypes } from '@cosmjs/stargate'
import { AminoMsgTransfer } from '@cosmjs/stargate'
import { DirectSignDocDecoder } from '@leapwallet/buffer-boba'
import { LeapWalletApi } from '@leapwallet/cosmos-wallet-hooks'
import { CosmosTxType } from '@leapwallet/cosmos-wallet-hooks'
import { getTxHashFromSignedTx, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  cosmosAminoConverters,
  cosmosProtoRegistry,
  cosmwasmAminoConverters,
  cosmwasmProtoRegistry,
  ibcAminoConverters as originalIbcAminoConverters,
  ibcProtoRegistry,
  osmosisAminoConverters as originalOsmosisAminoConverters,
  osmosisProtoRegistry,
} from '@osmosis-labs/proto-codecs'
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing'
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import Long from 'long'
import { strideAminoConverters } from 'stridejs'

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
    }: AminoMsgTransfer['value']): MsgTransfer => {
      return {
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
})

const registry = new Registry([
  ...cosmosProtoRegistry,
  ...osmosisProtoRegistry,
  ...cosmwasmProtoRegistry,
  ...ibcProtoRegistry,
])

import LogCosmosDappTx = LeapWalletApi.LogCosmosDappTx

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
) {
  if (origin.trim().toLowerCase().includes('cosmos.leapwallet.io')) {
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
) {
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
  })
}
