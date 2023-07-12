/* eslint-disable no-unused-vars */
import { calculateFee } from '@cosmjs/stargate'
import {
  FeeTokenData,
  GasOptions,
  useChainInfo,
  useGasAdjustment,
  useNativeFeeDenom,
} from '@leapwallet/cosmos-wallet-hooks'
import { GasPrice, NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { DisplayFeeValue, GasPriceOptionValue } from 'components/gas-price-options/context'
import PopupLayout from 'components/layout/popup-layout'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'

import ReviewSheet from './components/review-sheet'
import SlippageSheet from './components/slippage-sheet'
import SwapInput from './components/swap-input'
import TargetTokenSheet from './components/target-token-sheet'
import UserTokenSheet from './components/user-token-sheet'
import { SwapProvider, useSwapContext } from './swap-context'
import { SwapSheet } from './types'

const SwapUI: React.FC<{
  setActiveSheet: React.Dispatch<React.SetStateAction<SwapSheet>>
  children: (
    displayFeeValue: DisplayFeeValue,
    feeDenom: NativeDenom,
    gasLimit: string,
    gasPrice: GasPrice,
  ) => JSX.Element | null
}> = ({ children, setActiveSheet }) => {
  const defaultGasPrice = useDefaultGasPrice()
  const nativeFeeDenom = useNativeFeeDenom()
  const [{ defaultGasAmount }] = useSwapContext()
  const gasAdjustment = useGasAdjustment()

  const [feeDenom, setFeeDenom] = useState(nativeFeeDenom)
  const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
    option: GasOptions.LOW,
    gasPrice: defaultGasPrice.gasPrice,
  })
  const [gasLimit, setGasLimit] = useState(defaultGasAmount.toString())
  const [showFeesSettingSheet, setShowFeesSettingSheet] = useState<boolean>(false)
  const [gasError, setGasError] = useState<string | null>(null)
  const [displayFeeValue, setDisplayFeeValue] = useState<DisplayFeeValue>({
    value: 0,
    formattedAmount: '',
    fiatValue: '',
  })

  const onGasPriceOptionChange = useCallback(
    (value: GasPriceOptionValue, newFeeDenom: FeeTokenData) => {
      setGasPriceOption(value)
      setFeeDenom(newFeeDenom.denom)
    },
    [],
  )

  const customFee = useMemo(() => {
    const gasEstimate = Math.ceil(Number(gasLimit) * gasAdjustment)
    return calculateFee(gasEstimate, gasPriceOption.gasPrice)
  }, [gasAdjustment, gasLimit, gasPriceOption.gasPrice])

  useEffect(() => {
    setGasPriceOption({
      option: GasOptions.LOW,
      gasPrice: defaultGasPrice.gasPrice,
    })
  }, [defaultGasPrice])

  return (
    <GasPriceOptions
      recommendedGasLimit={defaultGasAmount.toString()}
      gasLimit={gasLimit}
      setGasLimit={(value) => setGasLimit(value.toString())}
      gasPriceOption={gasPriceOption}
      onGasPriceOptionChange={onGasPriceOptionChange}
      error={gasError}
      setError={setGasError}
    >
      <div className='h-full'>
        <SwapInput
          setStep={setActiveSheet}
          showFeesSettingSheet={showFeesSettingSheet}
          setShowFeesSettingSheet={setShowFeesSettingSheet}
          setDisplayFeeValue={setDisplayFeeValue}
          gasError={gasError}
          customFee={customFee}
        />
      </div>
      {children(displayFeeValue, feeDenom, gasLimit, gasPriceOption.gasPrice)}
    </GasPriceOptions>
  )
}

/**
 * This component renders the Swap UI.
 */
export default function SwapScreen(): JSX.Element {
  const activeChain = useActiveChain()
  const navigate = useNavigate()
  const [activeSheet, setActiveSheet] = useState<SwapSheet>(SwapSheet.NONE_ACTIVE)
  const chainInfo = useChainInfo()

  const renderSheets = useCallback(
    (
      displayFeeValue: DisplayFeeValue,
      feeDenom: NativeDenom,
      gasLimit: string,
      gasPrice: GasPrice,
    ) => {
      const onClose = () => {
        setActiveSheet(SwapSheet.NONE_ACTIVE)
      }

      const showReviewSheet = () => {
        setActiveSheet(SwapSheet.REVIEW_SWAP)
      }

      return (
        <>
          <UserTokenSheet isOpen={activeSheet === SwapSheet.SELECT_TOKEN} onClose={onClose} />
          <TargetTokenSheet
            isOpen={activeSheet === SwapSheet.SELECT_TARGET_TOKEN}
            onClose={onClose}
          />
          <SlippageSheet
            isOpen={activeSheet === SwapSheet.REVIEW_SLIPPAGE}
            onClose={onClose}
            onDone={showReviewSheet}
            themeColor={chainInfo.theme.primaryColor ?? Colors.cosmosPrimary}
          />
          <ReviewSheet
            feeDenom={feeDenom}
            customFee={{
              gasLimit,
              gasPrice,
            }}
            isOpen={activeSheet === SwapSheet.REVIEW_SWAP}
            displayFeeValue={displayFeeValue}
            onDone={onClose}
          />
        </>
      )
    },
    [activeSheet, chainInfo.theme.primaryColor],
  )

  return (
    <div className='relative w-[400px] overflow-clip'>
      <PopupLayout
        header={
          <Header
            title={'Swap'}
            action={{
              onClick: () => navigate(-1),
              type: HeaderActionType.BACK,
            }}
            topColor={Colors.getChainColor(activeChain)}
          />
        }
      >
        <SwapProvider chain={activeChain}>
          <SwapUI setActiveSheet={setActiveSheet}>{renderSheets}</SwapUI>
        </SwapProvider>
      </PopupLayout>
    </div>
  )
}
