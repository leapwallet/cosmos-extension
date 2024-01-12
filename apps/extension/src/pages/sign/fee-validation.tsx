import {
  currencyDetail,
  fetchCurrency,
  useFeeTokens,
  useTransactionConfigs,
  validateFee,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  denoms,
  fromSmallBN,
  NativeDenom,
  SupportedChain,
  SupportedDenoms,
} from '@leapwallet/cosmos-wallet-sdk'
import Long from 'long'
import { useCallback } from 'react'

type FeeValidationParams = {
  feeDenomData: NativeDenom
  gaslimit: Long
  feeAmount: string
  feeDenom: string
  chain: SupportedChain
  maxFeeUsdValue: number
  feeDenomUsdValue?: string
}

export async function feeValidation({
  feeDenomData,
  gaslimit,
  feeAmount,
  feeDenom,
  chain,
  feeDenomUsdValue,
  maxFeeUsdValue,
}: FeeValidationParams) {
  const isValidFee = validateFee(feeAmount, feeDenom, gaslimit.toNumber(), chain)
  if (isValidFee && !feeDenomUsdValue) return null
  let isValidUsdValue = false
  if (feeDenomUsdValue) {
    const feeAmountUsd = fromSmallBN(feeAmount, feeDenomData.coinDecimals).multipliedBy(
      feeDenomUsdValue,
    )
    isValidUsdValue = feeAmountUsd.lt(maxFeeUsdValue)
  }
  return isValidFee && isValidUsdValue
}

/*
 * useFeeValidation returns a function that takes in a FeeValidationParams object and returns a boolean or null
 * null value is returned when feeValidation could not be performed due to missing feeDenomData
 *
 */

type UseFeeValidationReturn = (
  feeValidationParams: Omit<
    FeeValidationParams,
    'feeDenomData' | 'maxFeeUsdValue' | 'feeDenomUsdValue'
  >,
  onValidationFailed: (tokenData: NativeDenom, isFeesValid: boolean | null) => void,
) => Promise<boolean | null>

export function useFeeValidation(chain: SupportedChain): UseFeeValidationReturn {
  const { data: txConfig } = useTransactionConfigs()

  const { data: feeTokens } = useFeeTokens(chain, 'mainnet')

  return useCallback(
    async (feeValidationParams, onValidationFailed) => {
      const maxFeeUsdValue = txConfig?.allChains.maxFeeValueUSD ?? 10
      const feeToken = feeTokens?.find(
        ({ denom }) => denom.coinMinimalDenom === feeValidationParams.feeDenom,
      )
      let feeDenomData = feeToken?.denom
      if (!feeDenomData) {
        feeDenomData = denoms[feeValidationParams.feeDenom as SupportedDenoms]
      }
      const usdValue = await fetchCurrency(
        '1',
        feeDenomData.coinGeckoId,
        feeDenomData.chain as SupportedChain,
        currencyDetail.US.currencyPointer,
      )

      const isFeeValid = await feeValidation({
        feeDenomData,
        maxFeeUsdValue,
        feeDenomUsdValue: usdValue,
        ...feeValidationParams,
      })
      if (!isFeeValid) onValidationFailed(feeDenomData, isFeeValid)
      return isFeeValid
    },
    [feeTokens, txConfig],
  )
}
