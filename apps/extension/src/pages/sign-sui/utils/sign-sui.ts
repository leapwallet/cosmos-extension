import { calculateFee, StdFee } from '@cosmjs/stargate'
import { GasPrice, NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import BigNumber from 'bignumber.js'
import { getStdFee } from 'pages/sign-aptos/utils/get-fee'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getOriginalSignDoc(signRequestData: any, isDisplay: boolean = false) {
  const transaction = new Uint8Array(Object.values(signRequestData))
  if (isDisplay) {
    const message = new TextDecoder().decode(new Uint8Array(Object.values(signRequestData)))
    return {
      signDoc: message,
      signOptions: {},
    }
  }
  return {
    signDoc: transaction,
    signOptions: {},
  }
}

function getDefaultFee(nativeFeeDenom: NativeDenom) {
  return calculateFee(
    Number(1000000),
    GasPrice.fromString(`${0}${nativeFeeDenom.coinMinimalDenom}`),
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
          gasPrice,
        )

  //@ts-ignore
  fee.amount[0].amount = new BigNumber(fee.amount[0].amount).toString()

  return fee
}

export function getSuiSignDoc({
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
  const { signOptions } = getOriginalSignDoc(signRequestData.signDoc)
  const defaultFee = getDefaultFee(nativeFeeDenom)
  const updatedFee = getUpdatedFee(defaultFee, gasLimit, gasPrice, isGasOptionSelected, signOptions)

  return {
    updatedSignDoc: signRequestData.signDoc,
    updatedFee,
    allowSetFee: false,
    defaultFee: updatedFee,
    defaultMemo: '',
  }
}
