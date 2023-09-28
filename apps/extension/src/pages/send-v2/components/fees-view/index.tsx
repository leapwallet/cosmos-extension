import { FeeTokenData } from '@leapwallet/cosmos-wallet-hooks'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import { useSendContext } from 'pages/send-v2/context'
import React, { useCallback, useEffect, useState } from 'react'

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
  } = useSendContext()
  const defaultGasPrice = useDefaultGasPrice()

  const [gasError, setGasError] = useState<string | null>(null)
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
    },
    [setFeeDenom],
  )

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
    <div>
      <GasPriceOptions
        recommendedGasLimit={gasEstimate.toString()}
        gasLimit={userPreferredGasLimit?.toString() ?? gasEstimate.toString()}
        setGasLimit={(value) => setUserPreferredGasLimit(Number(value.toString()))}
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
}
