import {
  FeeTokenData,
  GasOptions,
  GasPriceStep,
  getGasPricesForOsmosisFee,
} from '@leapwallet/cosmos-wallet-hooks'
import { defaultGasPriceStep, GasPrice, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { captureException } from '@sentry/react'
import React from 'react'

import { GasPriceOptionValue } from './context'

type UpdateFeeTokenDataParams = {
  foundFeeTokenData: FeeTokenData | undefined
  activeChain: SupportedChain
  lcdUrl: string | undefined
  baseGasPriceStep: GasPriceStep
  chainNativeFeeTokenData: FeeTokenData
  setFeeTokenData: React.Dispatch<React.SetStateAction<FeeTokenData | undefined>>
  onGasPriceOptionChange: (value: GasPriceOptionValue, feeDenom: FeeTokenData) => void
  notUpdateGasPrice?: boolean
}

/**
 *
 * @param foundFeeTokenData - Fee Token data that we want to set as default fee token data
 * @param activeChain - Active chain
 * @param lcdUrl - Lcd URL of the active chain. This is used in case of osmosis to fetch gas prices
 * @param baseGasPriceStep - Base gas price step. This is used in case of osmosis, when fetching gas prices fails somehow.
 * @param chainNativeFeeTokenData - Native fee token data of the active chain. This is used as fallback in case of not finding fee token data.
 * @param setFeeTokenData - Function to set fee token data
 * @param onGasPriceOptionChange - Function to set gas price option. This is important to set the default gas price option (This is used in actual transaction).
 * @param notUpdateGasPrice - [Optional] If true, then we don't call onGasPriceOptionChange parameter
 */
export async function updateFeeTokenData({
  foundFeeTokenData,
  activeChain,
  lcdUrl,
  baseGasPriceStep,
  chainNativeFeeTokenData,
  setFeeTokenData,
  onGasPriceOptionChange,
  notUpdateGasPrice = false,
}: UpdateFeeTokenDataParams) {
  let feeTokenDataToSet = foundFeeTokenData
  if (foundFeeTokenData) {
    if (
      activeChain === 'osmosis' &&
      foundFeeTokenData &&
      ![foundFeeTokenData.ibcDenom, foundFeeTokenData.denom.coinMinimalDenom].includes('uosmo')
    ) {
      try {
        const gasPriceStep = await getGasPricesForOsmosisFee(
          lcdUrl ?? '',
          foundFeeTokenData.ibcDenom ?? '',
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
        captureException(error)
      }
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
          option: GasOptions.LOW,
          gasPrice: GasPrice.fromUserInput(
            feeTokenDataToSet.gasPriceStep.low.toString(),
            feeTokenDataToSet.ibcDenom ?? feeTokenDataToSet?.denom?.coinMinimalDenom,
          ),
        },
        feeTokenDataToSet,
      )
  }
}
