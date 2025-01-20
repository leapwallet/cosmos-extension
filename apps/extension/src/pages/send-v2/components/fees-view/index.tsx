import { FeeTokenData } from '@leapwallet/cosmos-wallet-hooks'
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import BigNumber from 'bignumber.js'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import { observer } from 'mobx-react-lite'
import { useSendContext } from 'pages/send-v2/context'
import React, { useCallback, useEffect, useRef, useState } from 'react'

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
      userPreferredGasPrice,
      userPreferredGasLimit,
      setUserPreferredGasLimit,
      setUserPreferredGasPrice,
      gasEstimate,
      gasOption,
      setGasOption,
      setFeeDenom,
      selectedToken,
      gasError,
      setGasError,
      addressWarning,
      sendActiveChain,
      sendSelectedNetwork,
      isSeiEvmTransaction,
    } = useSendContext()

    const denoms = rootDenomsStore.allDenoms

    const defaultGasPrice = useDefaultGasPrice(denoms, {
      activeChain: sendActiveChain,
      selectedNetwork: sendSelectedNetwork,
      isSeiEvmTransaction,
    })

    const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
      option: gasOption,
      gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
    })
    const gasPriceSetFromGasPriceOptions = useRef<boolean>(false)

    const onClose = useCallback(() => {
      setShowFeesSettingSheet(false)
    }, [])

    const handleGasPriceOptionChange = useCallback(
      (value: GasPriceOptionValue, feeTokenData: FeeTokenData) => {
        gasPriceSetFromGasPriceOptions.current = true
        setGasPriceOption(value)
        setFeeDenom({ ...feeTokenData.denom, ibcDenom: feeTokenData.ibcDenom })
      },
      [setFeeDenom],
    )

    // initialize gasPriceOption with correct defaultGasPrice.gasPrice
    useEffect(() => {
      if (gasPriceSetFromGasPriceOptions.current) {
        return
      }
      setGasPriceOption({
        option: gasOption,
        gasPrice: defaultGasPrice.gasPrice,
      })

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultGasPrice.gasPrice.amount.toString(), defaultGasPrice.gasPrice.denom])

    useEffect(() => {
      setGasOption(gasPriceOption.option)
      setUserPreferredGasPrice(gasPriceOption.gasPrice)
    }, [gasPriceOption, setGasOption, setUserPreferredGasPrice])

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
          isSelectedTokenEvm={selectedToken?.isEvm}
          chain={sendActiveChain}
          network={sendSelectedNetwork}
          isSeiEvmTransaction={isSeiEvmTransaction}
          rootDenomsStore={rootDenomsStore}
          rootBalanceStore={rootBalanceStore}
        >
          {addressWarning.type === 'link' ? null : (
            <DisplayFee setShowFeesSettingSheet={setShowFeesSettingSheet} />
          )}

          {gasError && !showFeesSettingSheet ? (
            <p className='text-red-300 text-sm font-medium mt-2 text-center'>{gasError}</p>
          ) : null}

          <FeesSettingsSheet
            showFeesSettingSheet={showFeesSettingSheet}
            onClose={onClose}
            gasError={gasError}
            hideAdditionalSettings={
              sendActiveChain === 'bitcoin' || sendActiveChain === 'bitcoinSignet'
            }
          />
        </GasPriceOptions>
      </div>
    )
  },
)
