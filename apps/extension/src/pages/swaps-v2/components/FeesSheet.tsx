import { FeeTokenData } from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'
import GasPriceOptions from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import React, { Dispatch, SetStateAction, useCallback } from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'

import { useSwapContext } from '../context'

const FeesSheet = ({
  showFeesSettingSheet,
  setShowFeesSettingSheet,
}: {
  showFeesSettingSheet: boolean
  setShowFeesSettingSheet: Dispatch<SetStateAction<boolean>>
}) => {
  const {
    sourceChain,
    setFeeDenom,
    setGasOption,
    gasEstimate,
    userPreferredGasLimit,
    setUserPreferredGasLimit,
    setUserPreferredGasPrice,
    setGasError,
    gasError,
    gasPriceOption,
    setGasPriceOption,
  } = useSwapContext()

  const handleGasPriceOptionChange = useCallback(
    (value: GasPriceOptionValue, feeTokenData: FeeTokenData) => {
      setGasPriceOption?.(value)
      setFeeDenom({ ...feeTokenData.denom, ibcDenom: feeTokenData.ibcDenom })
      setGasOption(value.option)
      setUserPreferredGasPrice(value.gasPrice)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <GasPriceOptions
      recommendedGasLimit={gasEstimate.toString()}
      gasLimit={userPreferredGasLimit?.toString() ?? gasEstimate.toString()}
      setGasLimit={(value: number | string | BigNumber) =>
        setUserPreferredGasLimit(Number(value.toString()))
      }
      gasPriceOption={gasPriceOption}
      onGasPriceOptionChange={handleGasPriceOptionChange}
      error={gasError}
      setError={setGasError}
      chain={sourceChain?.key}
      rootDenomsStore={rootDenomsStore}
      rootBalanceStore={rootBalanceStore}
    >
      <FeesSettingsSheet
        showFeesSettingSheet={showFeesSettingSheet}
        onClose={() => {
          setShowFeesSettingSheet(false)
        }}
        gasError={gasError}
      />
    </GasPriceOptions>
  )
}

export default FeesSheet
