import { Deserializer, SimpleTransaction } from '@aptos-labs/ts-sdk'
import { calculateFee } from '@cosmjs/stargate'
import { GasPrice, NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import BigNumber from 'bignumber.js'

import { getStdFee } from './get-fee'

export function getAptosSignDoc({
  signRequestData,
  gasPrice,
  gasLimit,
  isGasOptionSelected,
  nativeFeeDenom,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signRequestData: Record<string, any>
  gasPrice: GasPrice
  gasLimit: string
  isGasOptionSelected: boolean
  nativeFeeDenom: NativeDenom
}) {
  const _signDoc = Uint8Array.from(Buffer.from(signRequestData.signDoc, 'hex'))
  const signOptions = signRequestData.signOptions

  const deserializer = new Deserializer(_signDoc)
  const signDoc = deserializer.deserialize(SimpleTransaction)

  const defaultFee = calculateFee(
    Number(signDoc.rawTransaction.max_gas_amount ?? 0),
    GasPrice.fromString(
      `${signDoc.rawTransaction.gas_unit_price ?? 0}${nativeFeeDenom.coinMinimalDenom}`,
    ),
  )

  const sortedSignDoc = {
    chain_id: signDoc.rawTransaction.chain_id,
    fee: defaultFee,
    ...signDoc,
  }

  const customGasLimit = new BigNumber(gasLimit)

  const fee =
    signOptions?.preferNoSetFee && !isGasOptionSelected
      ? sortedSignDoc.fee
      : getStdFee(
          !customGasLimit.isNaN() && customGasLimit.isGreaterThan(0)
            ? customGasLimit.toString()
            : sortedSignDoc.fee.gas,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          gasPrice,
        )

  sortedSignDoc.fee = fee

  const signDocForSigning = signDoc

  return {
    signDocForSigning,
    signDoc: { ...sortedSignDoc },
    fee: sortedSignDoc.fee,
    allowSetFee: !signOptions?.preferNoSetFee,
    defaultFee,
    defaultMemo: '',
  }
}
