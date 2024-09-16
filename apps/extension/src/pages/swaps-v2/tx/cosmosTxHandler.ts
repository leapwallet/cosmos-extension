import { makeSignDoc as createSignAminoDoc, OfflineAminoSigner } from '@cosmjs/amino'
import { createWasmAminoConverters } from '@cosmjs/cosmwasm-stargate'
import { fromBase64 } from '@cosmjs/encoding'
import { Int53 } from '@cosmjs/math'
import { makeAuthInfoBytes, Registry, type TxBodyEncodeObject } from '@cosmjs/proto-signing'
import { AminoTypes, defaultRegistryTypes, StdFee } from '@cosmjs/stargate'
import {
  createDefaultAminoConverters,
  fetchAccountDetails,
  LeapLedgerSigner,
} from '@leapwallet/cosmos-wallet-sdk'
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import { SourceChain } from 'types/swap'

import { getPublicKey } from '../utils'

export async function handleCosmosTx(
  encodedMessage: { typeUrl: string; value: MsgTransfer },
  fee: StdFee,
  messageChain: SourceChain,
  wallet: LeapLedgerSigner,
  senderAddress: string,
  memo = '',
) {
  let txRaw
  let txBytesString
  const accountDetails = await fetchAccountDetails(messageChain.restUrl, senderAddress)
  const walletAccounts = await wallet.getAccounts()
  const aminoTypes = new AminoTypes({
    ...createDefaultAminoConverters('cosmos'),
    ...createWasmAminoConverters(),
  })

  const msgs = [aminoTypes.toAmino(encodedMessage)]

  if (encodedMessage.value.memo) {
    msgs[0].value.memo = encodedMessage.value.memo
  }
  const signAminoDoc = createSignAminoDoc(
    msgs,
    fee,
    String(messageChain.chainId),
    memo,
    accountDetails.accountNumber,
    accountDetails.sequence,
  )

  const signedAminoDoc = await (wallet as OfflineAminoSigner).signAmino(senderAddress, signAminoDoc)

  if ('signed' in signedAminoDoc && 'signature' in signedAminoDoc) {
    const signedTxBody = {
      messages: signedAminoDoc.signed.msgs.map((msg) => aminoTypes.fromAmino(msg)),
      memo: signedAminoDoc.signed.memo,
    }

    if (msgs[0].value.memo) {
      signedTxBody.messages[0].value.memo = msgs[0].value.memo
    }

    const signedTxBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: signedTxBody,
    }
    const registry = new Registry(defaultRegistryTypes)
    registry.register('/cosmwasm.wasm.v1.MsgExecuteContract', MsgExecuteContract)
    const signedTxBodyBytes = registry.encode(signedTxBodyEncodeObject)

    const signedGasLimit = Int53.fromString(signedAminoDoc.signed.fee.gas).toNumber()
    const signedSequence = Int53.fromString(signedAminoDoc.signed.sequence).toNumber()

    const signMode: SignMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON

    const pubkey = getPublicKey({
      chainId: String(messageChain.chainId),
      coinType: messageChain.coinType,
      key: walletAccounts[0].pubkey,
    })

    const signedAuthInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence: signedSequence }],
      signedAminoDoc.signed.fee.amount,
      signedGasLimit,
      signedAminoDoc.signed.fee.granter,
      signedAminoDoc.signed.fee.payer,
      signMode,
    )
    txRaw = TxRaw.fromPartial({
      bodyBytes: signedTxBodyBytes,
      authInfoBytes: signedAuthInfoBytes,
      signatures: [fromBase64(signedAminoDoc.signature.signature)],
    })
    const txBytes = TxRaw.encode(txRaw).finish()
    txBytesString = Buffer.from(txBytes).toString('base64')
  } else {
    txRaw = signedAminoDoc
    const txBytes = TxRaw.encode(txRaw).finish()
    txBytesString = Buffer.from(txBytes).toString('base64')
  }
  return { txRaw, txBytesString }
}
