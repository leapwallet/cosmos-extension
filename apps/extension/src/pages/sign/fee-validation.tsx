import {
  currencyDetail,
  fetchCurrency,
  Token,
  useChainApis,
  useChainId,
  useFeeTokens,
  useSelectedNetwork,
  useTransactionConfigs,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  DenomsRecord,
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
  lcdUrl: string
}

export async function feeValidation({
  feeDenomData,
  feeAmount,
  feeDenomUsdValue,
  maxFeeUsdValue,
}: FeeValidationParams) {
  if (!feeDenomUsdValue) return null
  let isValidUsdValue = false
  if (feeDenomUsdValue) {
    const feeAmountUsd = fromSmallBN(feeAmount, feeDenomData.coinDecimals).multipliedBy(
      feeDenomUsdValue,
    )
    isValidUsdValue = feeAmountUsd.lt(maxFeeUsdValue)
  }
  return isValidUsdValue
}

/*
 * useFeeValidation returns a function that takes in a FeeValidationParams object and returns a boolean or null
 * null value is returned when feeValidation could not be performed due to missing feeDenomData
 *
 */

type UseFeeValidationReturn = (
  feeValidationParams: Omit<
    FeeValidationParams,
    'feeDenomData' | 'maxFeeUsdValue' | 'feeDenomUsdValue' | 'lcdUrl'
  >,
  onValidationFailed: (tokenData: NativeDenom, isFeesValid: boolean | null) => void,
) => Promise<boolean | null>

export function useFeeValidation(
  allAssets: Token[],
  denoms: DenomsRecord,
  chain: SupportedChain,
): UseFeeValidationReturn {
  const { data: txConfig } = useTransactionConfigs()
  const selectedNetwork = useSelectedNetwork()

  const { data: feeTokens, status } = useFeeTokens(
    allAssets,
    denoms,
    chain,
    selectedNetwork ?? 'mainnet',
  )
  const { lcdUrl } = useChainApis(chain)
  const chainId = useChainId()

  return useCallback(
    async (feeValidationParams, onValidationFailed) => {
      const maxFeeUsdValue = txConfig?.allChains.maxFeeValueUSD ?? 10
      const feeToken = feeTokens?.find(({ ibcDenom, denom }) => {
        if (ibcDenom === feeValidationParams.feeDenom) {
          return ibcDenom === feeValidationParams.feeDenom
        }
        return denom?.coinMinimalDenom === feeValidationParams.feeDenom
      })
      let feeDenomData = feeToken?.denom
      if (!feeDenomData) {
        feeDenomData = denoms[feeValidationParams.feeDenom as SupportedDenoms]
      }

      let usdValue
      if (feeDenomData?.chain) {
        usdValue = await fetchCurrency(
          '1',
          feeDenomData.coinGeckoId,
          feeDenomData.chain as SupportedChain,
          currencyDetail.US.currencyPointer,
          `${chainId}-${feeDenomData.coinMinimalDenom}`,
        )
      }

      const isFeeValid = await feeValidation({
        feeDenomData,
        maxFeeUsdValue,
        feeDenomUsdValue: usdValue,
        lcdUrl: lcdUrl ?? '',
        ...feeValidationParams,
      })
      if (!isFeeValid) onValidationFailed(feeDenomData, isFeeValid)
      return isFeeValid
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feeTokens, txConfig, status, lcdUrl],
  )
}
