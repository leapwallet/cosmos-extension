import {
  FeeTokenData,
  GasOptions,
  GasPriceStep,
  getGasPricesForOsmosisFee,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  defaultGasPriceStep,
  GasPrice,
  NetworkType,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { captureException } from '@sentry/react'
import { chainApisStore } from 'stores/chains-api-store'
import { gasPriceStepForChainStore } from 'stores/fee-store'
import { uiErrorTags } from 'utils/sentry'

import { GasPriceOptionValue } from './context'

type UpdateFeeTokenDataParams = {
  foundFeeTokenData?: FeeTokenData
  activeChain: SupportedChain
  selectedNetwork: NetworkType
  chainNativeFeeTokenData?: FeeTokenData
  setFeeTokenData: (feeDenom: FeeTokenData) => void
  onGasPriceOptionChange: (value: GasPriceOptionValue, feeDenom: FeeTokenData) => void
  notUpdateGasPrice?: boolean
  hasToCalculateDynamicFee: boolean
  defaultGasPriceOption?: GasOptions
  getFeeMarketGasPricesSteps: (
    feeDenom: string,
    forceBaseGasPriceStep?: GasPriceStep,
    isIbcDenom?: boolean,
  ) => Promise<GasPriceStep>
}

/**
 *
 * @param foundFeeTokenData - Fee Token data that we want to set as default fee token data
 * @param activeChain - Active chain
 * @param baseGasPriceStep - Base gas price step. This is used in case of osmosis, when fetching gas prices fails somehow.
 * @param chainNativeFeeTokenData - Native fee token data of the active chain. This is used as fallback in case of not finding fee token data.
 * @param setFeeTokenData - Function to set fee token data
 * @param onGasPriceOptionChange - Function to set gas price option. This is important to set the default gas price option (This is used in actual transaction).
 * @param notUpdateGasPrice - [Optional] If true, then we don't call onGasPriceOptionChange parameter
 */
export async function updateFeeTokenData({
  foundFeeTokenData,
  activeChain,
  selectedNetwork,
  chainNativeFeeTokenData,
  setFeeTokenData,
  onGasPriceOptionChange,
  notUpdateGasPrice = false,
  hasToCalculateDynamicFee,
  getFeeMarketGasPricesSteps,
  defaultGasPriceOption = GasOptions.LOW,
}: UpdateFeeTokenDataParams) {
  let feeTokenDataToSet = foundFeeTokenData
  if (foundFeeTokenData) {
    if (
      activeChain === 'osmosis' &&
      foundFeeTokenData &&
      ![foundFeeTokenData.ibcDenom, foundFeeTokenData.denom.coinMinimalDenom].includes('uosmo')
    ) {
      try {
        const [baseGasPriceStep, { lcdUrl }] = await Promise.all([
          gasPriceStepForChainStore.getGasPriceSteps(activeChain, selectedNetwork),
          chainApisStore.getChainApis(activeChain, selectedNetwork),
        ])

        const gasPriceStep = await getGasPricesForOsmosisFee(
          lcdUrl ?? '',
          foundFeeTokenData.ibcDenom ?? foundFeeTokenData?.denom?.coinMinimalDenom ?? '',
          baseGasPriceStep,
        )
        feeTokenDataToSet = { ...foundFeeTokenData, gasPriceStep }
      } catch (error) {
        feeTokenDataToSet = {
          ...foundFeeTokenData,
          gasPriceStep: {
            low: defaultGasPriceStep.low,
            medium: defaultGasPriceStep.average,
            high: defaultGasPriceStep.high,
          },
        }
        captureException(error, {
          tags: uiErrorTags,
        })
      }
    } else if (hasToCalculateDynamicFee && foundFeeTokenData) {
      let feeDenom = foundFeeTokenData.denom?.coinMinimalDenom ?? ''
      if (foundFeeTokenData.ibcDenom?.toLowerCase().startsWith('ibc/')) {
        feeDenom = foundFeeTokenData.ibcDenom ?? feeDenom
      }

      const gasPriceStep = await getFeeMarketGasPricesSteps(
        feeDenom,
        foundFeeTokenData.gasPriceStep,
      )

      feeTokenDataToSet = { ...foundFeeTokenData, gasPriceStep }
    } else {
      feeTokenDataToSet = foundFeeTokenData
    }
  } else {
    feeTokenDataToSet = chainNativeFeeTokenData
  }

  if (feeTokenDataToSet) {
    setFeeTokenData(feeTokenDataToSet)

    !notUpdateGasPrice &&
      onGasPriceOptionChange(
        {
          option: defaultGasPriceOption,
          gasPrice: GasPrice.fromUserInput(
            feeTokenDataToSet.gasPriceStep.low.toString(),
            feeTokenDataToSet.ibcDenom ?? feeTokenDataToSet?.denom?.coinMinimalDenom,
          ),
        },
        feeTokenDataToSet,
      )
  }
}
