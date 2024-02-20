import {
  formatBigNumber,
  Token,
  useformatCurrency,
  useGasAdjustmentForChain,
  useGetTokenBalances,
  useIsCW20Tx,
  useSnipGetSnip20TokenBalances,
} from '@leapwallet/cosmos-wallet-hooks'
import { isValidAddressWithPrefix } from '@leapwallet/cosmos-wallet-sdk'
import { BigNumber } from 'bignumber.js'
import { ActionInputWithPreview } from 'components/action-input-with-preview'
import { calculateFeeAmount } from 'components/gas-price-options'
import Text from 'components/text'
import { motion } from 'framer-motion'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import { useSendContext } from 'pages/send-v2/context'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useLocation } from 'react-router'
import { imgOnError } from 'utils/imgOnError'

import { SelectTokenSheet } from './select-token-sheet'

type AmountCardProps = {
  themeColor: string
}

export const AmountCard: React.FC<AmountCardProps> = ({ themeColor }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const defaultTokenLogo = useDefaultTokenLogo()
  const locationState = useLocation().state

  const [showTokenSelectSheet, setShowTokenSelectSheet] = useState<boolean>(false)
  const [isMaxClicked, setIsMaxClicked] = useState(false)

  const { allAssets, nativeTokensStatus, s3IbcTokensStatus } = useGetTokenBalances()
  const { snip20Tokens } = useSnipGetSnip20TokenBalances()

  const [formatCurrency] = useformatCurrency()
  const chainInfos = useChainInfos()
  const isCW20Tx = useIsCW20Tx()
  const activeChain = useActiveChain()

  const {
    inputAmount,
    setInputAmount,
    selectedToken,
    setSelectedToken,
    tokenFiatValue,
    setAmountError,
    amountError,
    userPreferredGasPrice,
    userPreferredGasLimit,
    gasEstimate,
    selectedAddress,
    allGasOptions,
    gasOption,
    fee,
    feeDenom,
    sameChain,
  } = useSendContext()
  const gasAdjustment = useGasAdjustmentForChain()

  const handleMaxClick = () => {
    setIsMaxClicked(true)
  }

  const isSecretChainTargetAddress = useMemo(
    () => selectedAddress && isValidAddressWithPrefix(selectedAddress.address ?? '', 'secret'),
    [selectedAddress],
  )

  const assets = useMemo(() => {
    if (snip20Tokens && isSecretChainTargetAddress) {
      return allAssets.concat(snip20Tokens)
    }
    return allAssets
  }, [allAssets, isSecretChainTargetAddress, snip20Tokens])

  useEffect(() => {
    if (!selectedToken) {
      if (locationState && (locationState as Token).coinMinimalDenom) {
        setSelectedToken(locationState as Token)
      } else if (assets.length > 0) {
        const tokensWithBalance = assets.filter((token) => new BigNumber(token.amount).gt(0))
        setSelectedToken(tokensWithBalance[0])
      }
    }
  }, [
    assets,
    s3IbcTokensStatus,
    locationState,
    nativeTokensStatus,
    selectedToken,
    setSelectedToken,
  ])

  useEffect(() => {
    const isNativeToken =
      !!chainInfos[activeChain].nativeDenoms[selectedToken?.coinMinimalDenom ?? '']

    if (!allGasOptions || !gasOption) {
      return
    }

    if (isMaxClicked && isNativeToken) {
      const feeValue = parseFloat(allGasOptions[gasOption])

      setInputAmount(
        new BigNumber(selectedToken?.amount ?? 0)
          .minus(new BigNumber(feeValue))
          .toFixed(6, BigNumber.ROUND_DOWN),
      )
    }

    if (isMaxClicked && !isNativeToken) {
      setInputAmount(new BigNumber(selectedToken?.amount ?? 0).toFixed(6, BigNumber.ROUND_DOWN))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gasOption, isMaxClicked, selectedToken])

  useEffect(() => {
    const check = () => {
      if (selectedAddress?.address && !sameChain && selectedToken && isCW20Tx(selectedToken)) {
        return 'IBC not supported for cw20 tokens'
      }

      if (inputAmount === '') {
        return ''
      }
      // check if input is a valid digit
      if (isNaN(Number(inputAmount))) {
        return 'Please enter a valid amount'
      }
      // if input is negative
      if (new BigNumber(inputAmount).lt(0)) {
        return 'Please enter a positive amount'
      }
      // check if user has balance
      if (new BigNumber(inputAmount).gt(new BigNumber(selectedToken?.amount ?? ''))) {
        return 'Insufficient balance'
      }

      const feeDenomValue = allAssets.find((asset) => {
        return (
          asset.ibcDenom === feeDenom.coinMinimalDenom ||
          asset.coinMinimalDenom === feeDenom.coinMinimalDenom
        )
      })

      if (!fee || !userPreferredGasPrice || !feeDenomValue) {
        return ''
      }

      const { amount } = calculateFeeAmount({
        gasPrice: userPreferredGasPrice.amount.toFloatApproximation(),
        gasLimit: userPreferredGasLimit ?? gasEstimate,
        feeDenom: feeDenom,
        gasAdjustment,
      })

      if (amount.gt(feeDenomValue.amount)) {
        return 'Insufficient funds for fees.'
      }
    }

    setAmountError(check())

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allAssets,
    fee?.amount,
    feeDenom?.coinMinimalDenom,
    inputAmount,
    selectedToken,
    selectedAddress,
    gasAdjustment,
  ])

  return (
    <motion.div className='card-container'>
      <Text size='sm' className='text-gray-600 dark:text-gray-200 font-bold mb-3'>
        Amount to Send
      </Text>
      {nativeTokensStatus === 'success' ? (
        <>
          {selectedToken ? (
            <>
              <div className='flex items-center justify-between w-full mb-3'>
                <button
                  className='bg-gray-50 dark:bg-gray-800 rounded-full flex items-center py-2 pl-3 pr-2 cursor-pointer'
                  onClick={() => {
                    setShowTokenSelectSheet(true)
                  }}
                >
                  <img
                    src={selectedToken.img ?? defaultTokenLogo}
                    onError={imgOnError(defaultTokenLogo)}
                    className='h-6 w-6 mr-1'
                  />
                  <div className='text-black-100 dark:text-white-100 font-bold text-base'>
                    {selectedToken.symbol}
                  </div>
                  <img src={Images.Misc.ArrowDown} className='ml-2' />
                </button>
                <p
                  className='text-sm text-gray-700 dark:text-gray-400 font-bold'
                  title={`${new BigNumber(selectedToken.amount).decimalPlaces(
                    selectedToken?.coinDecimals ?? 6,
                  )} ${selectedToken.symbol}`}
                  data-testing-id='send-amount-token-balance'
                >
                  Balance: {formatBigNumber(new BigNumber(selectedToken.amount))}{' '}
                  {selectedToken.symbol}
                </p>
              </div>

              <ActionInputWithPreview
                action={inputAmount ? 'none' : 'max'}
                buttonText='MAX'
                buttonTextColor={themeColor}
                value={inputAmount}
                rightElement={
                  inputAmount && tokenFiatValue ? (
                    <p className='text-sm text-gray-400'>
                      ~ {formatCurrency(new BigNumber(tokenFiatValue).times(inputAmount))}
                    </p>
                  ) : undefined
                }
                onAction={(e, action) => {
                  if (action === 'max') {
                    handleMaxClick()
                  }
                }}
                onChange={(e) => {
                  setIsMaxClicked(false)
                  setInputAmount(e.target.value)
                }}
                placeholder='Enter amount'
                preview={undefined}
                invalid={!!amountError}
                ref={inputRef}
              />

              {amountError ? (
                <p
                  className='text-xs text-red-300 font-bold ml-1 mt-2'
                  data-testing-id='send-amount-error-ele'
                >
                  {amountError}
                </p>
              ) : null}
            </>
          ) : (
            <p className='text-sm text-red-300 font-bold' data-testing-id='send-no-tokens-ele'>
              You have no tokens
            </p>
          )}
        </>
      ) : (
        <div className='w-full z-0'>
          <div className='flex w-full justify-between items-center'>
            <Skeleton className='rounded-full h-10 w-20 bg-gray-50 dark:bg-gray-800' />
            <Skeleton className='rounded-full h-5 w-32 bg-gray-50 dark:bg-gray-800' />
          </div>
          <Skeleton className='rounded-lg h-10 bg-gray-50 dark:bg-gray-800 w-full mt-3' />
        </div>
      )}

      <SelectTokenSheet
        isOpen={showTokenSelectSheet}
        assets={assets}
        selectedToken={selectedToken as Token}
        onClose={() => {
          setShowTokenSelectSheet(false)
        }}
        onTokenSelect={(token) => {
          setSelectedToken(token)
          setInputAmount('')
          setIsMaxClicked(false)
          inputRef.current?.focus()
        }}
      />
    </motion.div>
  )
}
