import { FeeTokenData, GasOptions } from '@leapwallet/cosmos-wallet-hooks'
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import BigNumber from 'bignumber.js'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'

import { useSwapContext } from '../context'
import { SWAP_NETWORK } from '../hooks'

export const FeesView = observer(
  ({
    rootDenomsStore,
    rootBalanceStore,
  }: {
    rootDenomsStore: RootDenomsStore
    rootBalanceStore: RootBalanceStore
  }) => {
    const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false)
    const {
      sourceChain,
      setFeeDenom,
      setGasOption,
      gasOption,
      gasEstimate,
      userPreferredGasLimit,
      userPreferredGasPrice,
      setUserPreferredGasLimit,
      setUserPreferredGasPrice,
      setGasError,
      gasError,
    } = useSwapContext()

    const denoms = rootDenomsStore.allDenoms

    const defaultGasPrice = useDefaultGasPrice(denoms, {
      activeChain: sourceChain?.key ?? 'cosmos',
      selectedNetwork: SWAP_NETWORK,
    })

    const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
      option: gasOption,
      gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
    })

    const onClose = useCallback(() => {
      setShowFeesSettingSheet(false)
    }, [])

    const handleGasPriceOptionChange = useCallback(
      (value: GasPriceOptionValue, feeTokenData: FeeTokenData) => {
        setGasPriceOption(value)
        setFeeDenom({ ...feeTokenData.denom, ibcDenom: feeTokenData.ibcDenom })
        setGasOption(value.option)
        setUserPreferredGasPrice(value.gasPrice)
      },

      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    )

    useEffect(() => {
      setGasPriceOption({
        option: GasOptions.LOW,
        gasPrice: defaultGasPrice.gasPrice,
      })
      setGasOption(GasOptions.LOW)
      setUserPreferredGasPrice(defaultGasPrice.gasPrice)

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultGasPrice.gasPrice.amount.toString(), defaultGasPrice.gasPrice.denom])

    return (
      <div>
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
          network={SWAP_NETWORK}
          rootBalanceStore={rootBalanceStore}
          rootDenomsStore={rootDenomsStore}
        >
          <DisplayFee setShowFeesSettingSheet={setShowFeesSettingSheet} />

          {gasError && !showFeesSettingSheet ? (
            <p className='text-red-300 text-sm font-medium text-center mt-[4px]'>{gasError}</p>
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
