/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Token, useGasAdjustmentForChain } from '@leapwallet/cosmos-wallet-hooks'
import { isSuiChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  EvmBalanceStore,
  RootBalanceStore,
  RootCW20DenomsStore,
  RootDenomsStore,
  RootERC20DenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import { calculateFeeAmount } from 'components/gas-price-options'
import { motion } from 'framer-motion'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { observer } from 'mobx-react-lite'
import { useSendContext } from 'pages/send/context'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { allowUpdateInputStore } from 'stores/allow-update-input-store'
import { chainInfoStore } from 'stores/chain-infos-store'

import { TokenInputCard } from './TokenInputCard'

type AmountCardProps = {
  isAllAssetsLoading: boolean
  rootBalanceStore: RootBalanceStore
  rootCW20DenomsStore: RootCW20DenomsStore
  rootDenomsStore: RootDenomsStore
  rootERC20DenomsStore: RootERC20DenomsStore
  evmBalanceStore: EvmBalanceStore
  resetForm: boolean
  setShowTokenSelectSheet: (show: boolean) => void
  isTokenStatusSuccess: boolean
  amount: string
  setAmount: (amount: string) => void
}

export const AmountCard = observer(
  ({
    isAllAssetsLoading,
    rootBalanceStore,
    rootDenomsStore,
    rootCW20DenomsStore,
    rootERC20DenomsStore,
    evmBalanceStore,
    resetForm,
    setShowTokenSelectSheet,
    isTokenStatusSuccess,
    amount,
    setAmount,
  }: AmountCardProps) => {
    const chainInfos = chainInfoStore.chainInfos
    const selectedNetwork = useSelectedNetwork()
    const [isInputInUSDC, setIsInputInUSDC] = useState<boolean>(false)
    const allCW20Denoms = rootCW20DenomsStore.allCW20Denoms
    const allERC20Denoms = rootERC20DenomsStore.allERC20Denoms
    const { getAggregatedSpendableBalances } = rootBalanceStore
    const allAssets = getAggregatedSpendableBalances(selectedNetwork, undefined)
    const assets = useMemo(() => {
      const _assets = allAssets

      return _assets.sort((a, b) => Number(b.usdValue) - Number(a.usdValue))
    }, [allAssets])

    const isCW20Token = useCallback(
      (token: Token) => {
        if (!token) {
          return false
        }
        return Object.keys(allCW20Denoms).includes(token.coinMinimalDenom)
      },
      [allCW20Denoms],
    )

    const {
      inputAmount,
      setInputAmount,
      selectedToken,
      setSelectedToken,
      sendActiveChain,
      selectedChain,
      setSelectedChain,
      setAmountError,
      amountError,
      userPreferredGasPrice,
      userPreferredGasLimit,
      gasEstimate,
      selectedAddress,
      fee,
      feeDenom,
      sameChain,
      setFeeDenom,
      hasToUsePointerLogic,
      computedGas,
    } = useSendContext()

    const gasAdjustment = useGasAdjustmentForChain()

    function getFlooredFixed(v: number, d: number) {
      return (Math.floor(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d)
    }

    useEffect(() => {
      const amountDecimals = amount.split('.')?.[1]?.length
      const coinDecimals = selectedToken?.coinDecimals ?? 6
      if (amountDecimals > coinDecimals) {
        setInputAmount(getFlooredFixed(Number(amount), coinDecimals) as string)
      } else {
        setInputAmount(amount)
      }
    }, [amount, selectedToken?.coinDecimals])

    useEffect(() => {
      const check = () => {
        if (selectedAddress?.address && !sameChain && selectedToken && isCW20Token(selectedToken)) {
          return 'IBC transfers are not supported for cw20 tokens.'
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
        if (
          isSuiChain(sendActiveChain) &&
          isSuiChain(selectedToken?.chain ?? '') &&
          selectedToken?.coinMinimalDenom === 'mist' &&
          new BigNumber(fee?.amount?.[0]?.amount ?? 0).eq(0)
        ) {
          return 'Insufficient balance for fees'
        }

        const feeDenomValue = assets.find((asset) => {
          if (selectedToken?.isEvm && asset?.isEvm) {
            return asset.coinMinimalDenom === feeDenom?.coinMinimalDenom
          }

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
          isSeiEvmTransaction: chainInfos?.[sendActiveChain]?.evmOnlyChain,
          isSui: isSuiChain(sendActiveChain),
          computedGas: computedGas,
        })

        if (amount.gt(feeDenomValue.amount)) {
          return 'Insufficient funds for fees.'
        }
      }

      setAmountError(check())

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      assets,
      fee?.amount,
      feeDenom?.coinMinimalDenom,
      inputAmount,
      selectedToken,
      selectedAddress,
      gasAdjustment,
      sendActiveChain,
      chainInfos,
      allERC20Denoms,
      hasToUsePointerLogic,
      computedGas,
    ])

    useEffect(() => {
      if (resetForm) {
        setAmount('')
        setSelectedToken((selectedToken) => {
          const match = assets.find((asset) => {
            if (asset.ibcDenom) {
              return (
                asset.ibcDenom === selectedToken?.ibcDenom &&
                asset.tokenBalanceOnChain === selectedToken?.tokenBalanceOnChain
              )
            }
            return (
              asset.coinMinimalDenom === selectedToken?.coinMinimalDenom &&
              asset.tokenBalanceOnChain === selectedToken?.tokenBalanceOnChain
            )
          })
          // If the token is found in the assets, return it (Meaning token is still valid)
          if (match) {
            return match
          }
          /**
           * If the transaction had been initiated with Max button,
           * we need to update the selected token to the highest balance token
           */
          if (allowUpdateInputStore.updateAllowed()) {
            const highestBalanceToken = assets.sort(
              (a, b) => Number(b.usdValue ?? 0) - Number(a.usdValue ?? 0),
            )[0]
            return highestBalanceToken
          }
          return selectedToken
        })
      }
    }, [assets, resetForm, setSelectedToken])

    return (
      <motion.div className={classNames('px-6')}>
        <TokenInputCard
          isInputInUSDC={isInputInUSDC}
          setIsInputInUSDC={setIsInputInUSDC}
          value={amount}
          token={selectedToken}
          loadingAssets={!isTokenStatusSuccess}
          balanceStatus={isAllAssetsLoading}
          onChange={(value) => setAmount(value)}
          onTokenSelectSheet={() => setShowTokenSelectSheet(true)}
          amountError={amountError}
          sendActiveChain={sendActiveChain}
          selectedChain={selectedChain}
          resetForm={resetForm}
        />
      </motion.div>
    )
  },
)

AmountCard.displayName = 'AmountCard'
