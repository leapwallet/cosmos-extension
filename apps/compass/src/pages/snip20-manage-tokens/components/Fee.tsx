import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import BigNumber from 'bignumber.js'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'

import { useSnip20ManageTokens } from '../context'

export const Fee = observer(
  ({
    rootDenomsStore,
    rootBalanceStore,
  }: {
    rootDenomsStore: RootDenomsStore
    rootBalanceStore: RootBalanceStore
  }) => {
    const {
      gasOption,
      userPreferredGasLimit,
      userPreferredGasPrice,
      setGasOption,
      setUserPreferredGasPrice,
      setUserPreferredGasLimit,
      setGasError,
      recommendedGasLimit,
      gasError,
    } = useSnip20ManageTokens()
    const denoms = rootDenomsStore.allDenoms

    const defaultGasPrice = useDefaultGasPrice(denoms)
    const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false)
    const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
      option: gasOption,
      gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
    })

    const onClose = useCallback(() => {
      setShowFeesSettingSheet(false)
    }, [])

    const handleGasPriceOptionChange = useCallback((value: GasPriceOptionValue) => {
      setGasPriceOption(value)
    }, [])

    // initialize gasPriceOption with correct defaultGasPrice.gasPrice
    useEffect(() => {
      setGasPriceOption({
        option: gasOption,
        gasPrice: defaultGasPrice.gasPrice,
      })

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultGasPrice.gasPrice])

    useEffect(() => {
      setGasOption(gasPriceOption.option)
      setUserPreferredGasPrice(gasPriceOption.gasPrice)
    }, [gasPriceOption, setGasOption, setUserPreferredGasPrice])

    return (
      <div className='mb-4'>
        <GasPriceOptions
          recommendedGasLimit={recommendedGasLimit.toString()}
          gasLimit={userPreferredGasLimit?.toString() ?? recommendedGasLimit.toString()}
          setGasLimit={(value: number | string | BigNumber) =>
            setUserPreferredGasLimit(Number(value.toString()))
          }
          gasPriceOption={gasPriceOption}
          onGasPriceOptionChange={handleGasPriceOptionChange}
          error={gasError}
          setError={setGasError}
        >
          <DisplayFee setShowFeesSettingSheet={setShowFeesSettingSheet} />

          {gasError && !showFeesSettingSheet ? (
            <p className='text-red-300 text-sm font-medium mt-2 text-center'>{gasError}</p>
          ) : null}

          <FeesSettingsSheet
            showFeesSettingSheet={showFeesSettingSheet}
            onClose={onClose}
            gasError={gasError}
          />
        </GasPriceOptions>
      </div>
    )
  },
)
