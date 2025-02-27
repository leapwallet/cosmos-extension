import { Deserializer, RawTransaction, SimpleTransaction } from '@aptos-labs/ts-sdk'
import { calculateFee, StdFee } from '@cosmjs/stargate'
import { GasPrice, NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import BigNumber from 'bignumber.js'

import { getStdFee } from './get-fee'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getOriginalSignDoc(signRequestData: Record<string, any>) {
  const _signDoc = Uint8Array.from(Buffer.from(signRequestData.signDoc, 'hex'))
  const signOptions = signRequestData?.signOptions
  const deserializer = new Deserializer(_signDoc)
  const signDoc = deserializer.deserialize(SimpleTransaction)
  return {
    signDoc,
    signOptions,
  }
}

function getDefaultFee(signDoc: SimpleTransaction, nativeFeeDenom: NativeDenom) {
  return calculateFee(
    Number(signDoc.rawTransaction.max_gas_amount ?? 0),
    GasPrice.fromString(
      `${signDoc.rawTransaction.gas_unit_price ?? 0}${nativeFeeDenom.coinMinimalDenom}`,
    ),
  )
}

function getUpdatedFee(
  defaultFee: StdFee,
  gasLimit: string,
  gasPrice: GasPrice,
  isGasOptionSelected: boolean,
  signOptions?: { preferNoSetFee?: boolean },
) {
  const customGasLimit = new BigNumber(gasLimit)

  const fee =
    signOptions?.preferNoSetFee && !isGasOptionSelected
      ? defaultFee
      : getStdFee(
          !customGasLimit.isNaN() && customGasLimit.isGreaterThan(0)
            ? customGasLimit.toString()
            : defaultFee.gas,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          gasPrice,
        )

  return fee
}

function getUpdatedSignDoc(originalSignDoc: SimpleTransaction, updatedFee: StdFee) {
  const updatedRawTransaction = new RawTransaction(
    originalSignDoc.rawTransaction.sender,
    originalSignDoc.rawTransaction.sequence_number,
    originalSignDoc.rawTransaction.payload,
    BigInt(updatedFee.gas),
    originalSignDoc.rawTransaction.gas_unit_price,
    originalSignDoc.rawTransaction.expiration_timestamp_secs,
    originalSignDoc.rawTransaction.chain_id,
  )
  const updatedSignDoc = new SimpleTransaction(
    updatedRawTransaction,
    originalSignDoc.feePayerAddress,
  )

  return updatedSignDoc
}

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
  const { signDoc: originalSignDoc, signOptions } = getOriginalSignDoc(signRequestData)
  const defaultFee = getDefaultFee(originalSignDoc, nativeFeeDenom)
  const updatedFee = getUpdatedFee(defaultFee, gasLimit, gasPrice, isGasOptionSelected, signOptions)
  const updatedSignDoc = getUpdatedSignDoc(originalSignDoc, updatedFee)

  return {
    updatedSignDoc,
    updatedFee,
    allowSetFee: !signOptions?.preferNoSetFee,
    defaultFee,
    defaultMemo: '',
  }
}
