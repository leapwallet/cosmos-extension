import { fromBase64 } from '@cosmjs/encoding'
import { DirectSignDocDecoder } from '@leapwallet/buffer-boba'
import { GasPrice } from '@leapwallet/cosmos-wallet-sdk'
import { AuthInfo, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import Long from 'long'

import { getFee } from './get-fee'
import { getMilkywayMemo } from './get-milkyway-memo'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getProtoSignDocDecoder(signRequestData: Record<string, any>) {
  if (typeof signRequestData['sign-request'].signDoc.bodyBytes === 'string') {
    const bodyBytes = fromBase64(signRequestData['sign-request'].signDoc.bodyBytes)
    const authInfoBytes = fromBase64(signRequestData['sign-request'].signDoc.authInfoBytes)
    const chainId = signRequestData['sign-request'].signDoc.chainId
    const accountNumber = signRequestData['sign-request'].signDoc.accountNumber
    const signDoc = {
      bodyBytes,
      authInfoBytes,
      chainId,
      accountNumber,
    }
    return new DirectSignDocDecoder(signDoc)
  } else {
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      fee = getFee(_fee, gasPrice, gasLimit)
    }
  }

  const defaultMemo = getMilkywayMemo(
    signRequestData['sign-request'],
    protoSignDocDecoder.toJSON(),
    protoSignDocDecoder.txBody.memo,
  )

  const signDoc = {
    ...protoSignDocDecoder.signDoc,
    ...{
      bodyBytes: TxBody.encode({
        ...protoSignDocDecoder.txBody,
        timeoutHeight: new Long(Number(protoSignDocDecoder.txBody.timeoutHeight)),
        memo: defaultMemo || memo,
      }).finish(),
      authInfoBytes: AuthInfo.encode({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        signerInfos: protoSignDocDecoder.authInfo.signerInfos.map((signerInfo) => {
          return {
            ...signerInfo,
            sequence: new Long(Number(signerInfo.sequence)),
          }
        }),

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        fee,
      }).finish(),
    },
    accountNumber: new Long(Number(protoSignDocDecoder.signDoc.accountNumber)),
  }

  return { signDoc, fee, allowSetFee: !signOptions?.preferNoSetFee, defaultFee, defaultMemo }
}
