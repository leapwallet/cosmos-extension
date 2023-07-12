import { fromBase64 } from '@cosmjs/encoding'
import { DirectSignResponse } from '@cosmjs/proto-signing'
import { DirectSignDocDecoder } from '@leapwallet/buffer-boba'
import { LeapWalletApi } from '@leapwallet/cosmos-wallet-hooks'
import { CosmosTxType } from '@leapwallet/cosmos-wallet-hooks'
import { getTxHashFromSignedTx, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

import LogCosmosDappTx = LeapWalletApi.LogCosmosDappTx

export async function logDirectTx(
  data: DirectSignResponse,
  signDoc: SignDoc,
  origin: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fee: any,
  chain: SupportedChain,
  address: string,
  txPostToDb: LogCosmosDappTx,
) {
  if (origin.trim().toLowerCase().includes('cosmos.leapwallet.io')) {
    return
  }

  const txHash = getTxHashFromSignedTx({
    authInfoBytes: data.signed.authInfoBytes,
    bodyBytes: data.signed.bodyBytes,
    signatures: [fromBase64(data.signature.signature)],
  })
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const tx = new DirectSignDocDecoder(signDoc)

  await txPostToDb({
    txHash,
    txType: CosmosTxType.Dapp,
    metadata: {
      source: origin,
      tx_message: tx.toJSON(),
    },
    feeQuantity: fee?.amount[0]?.amount,
    feeDenomination: fee?.amount[0]?.denom,
    chain,
    address,
  })
}
