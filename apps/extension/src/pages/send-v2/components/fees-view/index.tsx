import { FeeTokenData } from '@leapwallet/cosmos-wallet-hooks'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import { useSendContext } from 'pages/send-v2/context'
import React, { useCallback, useEffect, useRef, useState } from 'react'

export const FeesView: React.FC = () => {
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
    isSeiEvmTransaction,
  } = useSendContext()

  const defaultGasPrice = useDefaultGasPrice({ isSeiEvmTransaction })
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
  }, [defaultGasPrice.gasPrice])

  useEffect(() => {
    setGasOption(gasPriceOption.option)
    setUserPreferredGasPrice(gasPriceOption.gasPrice)
  }, [gasPriceOption, setGasOption, setUserPreferredGasPrice])

  return (
    <div>
      <GasPriceOptions
        recommendedGasLimit={gasEstimate.toString()}
        gasLimit={userPreferredGasLimit?.toString() ?? gasEstimate.toString()}
        setGasLimit={(value: number) => setUserPreferredGasLimit(Number(value.toString()))}
        gasPriceOption={gasPriceOption}
        onGasPriceOptionChange={handleGasPriceOptionChange}
        error={gasError}
        setError={setGasError}
        isSelectedTokenEvm={selectedToken?.isEvm}
        isSeiEvmTransaction={isSeiEvmTransaction}
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
        />
      </GasPriceOptions>
    </div>
  )
}
