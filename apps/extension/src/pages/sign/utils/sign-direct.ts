import { DirectSignDocDecoder } from '@leapwallet/buffer-boba'
import { GasPrice } from '@leapwallet/cosmos-wallet-sdk'
import { AuthInfo, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import Long from 'long'

import { getFee } from './get-fee'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getProtoSignDocDecoder(signRequestData: Record<string, any>) {
  const signDoc = {
    bodyBytes: new Uint8Array(Object.values(signRequestData['sign-request'].signDoc.bodyBytes)),
    authInfoBytes: new Uint8Array(
      Object.values(signRequestData['sign-request'].signDoc.authInfoBytes),
    ),
    chainId: signRequestData['sign-request'].signDoc.chainId,
    accountNumber: signRequestData['sign-request'].signDoc.accountNumber,
  }
  return new DirectSignDocDecoder(signDoc)
}

export function getDirectSignDoc({
  signRequestData,
  gasPrice,
  gasLimit,
  memo,
  isGasOptionSelected,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signRequestData: Record<string, any>
  gasPrice: GasPrice
  gasLimit: string
  memo: string
  isGasOptionSelected: boolean
}) {
  const signOptions = signRequestData['sign-request'].signOptions

  const protoSignDocDecoder = getProtoSignDocDecoder(signRequestData)
  const _fee = protoSignDocDecoder.authInfo.fee
  const defaultFee = _fee

  let fee: typeof _fee

  if (_fee) {
    if (signOptions && signOptions.preferNoSetFee && !isGasOptionSelected) {
      fee = _fee
    } else {
      fee = getFee(_fee, gasPrice, gasLimit)
    }
  }

  const defaultMemo = protoSignDocDecoder.txBody.memo

  const signDoc = {
    ...protoSignDocDecoder.signDoc,
    ...{
      bodyBytes: TxBody.encode({
        ...protoSignDocDecoder.txBody,
        timeoutHeight: new Long(Number(protoSignDocDecoder.txBody.timeoutHeight)),
        memo: defaultMemo || memo,
      }).finish(),
      authInfoBytes: AuthInfo.encode({
        signerInfos: protoSignDocDecoder.authInfo.signerInfos.map((signerInfo) => {
          return {
            ...signerInfo,
            sequence: new Long(Number(signerInfo.sequence)),
          }
        }),
        fee,
      }).finish(),
    },
    accountNumber: new Long(Number(protoSignDocDecoder.signDoc.accountNumber)),
  }

  return { signDoc, fee, allowSetFee: !signOptions?.preferNoSetFee, defaultFee, defaultMemo }
}
