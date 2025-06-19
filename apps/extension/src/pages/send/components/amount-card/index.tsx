/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Token, useGasAdjustmentForChain } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
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
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { motion } from 'framer-motion'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import useQuery from 'hooks/useQuery'
import { observer } from 'mobx-react-lite'
import { useSendContext } from 'pages/send/context'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { chainInfoStore } from 'stores/chain-infos-store'
import { AggregatedSupportedChain } from 'types/utility'

import { SelectTokenSheet } from './select-token-sheet'
import { TokenInputCard } from './TokenInputCard'

type AmountCardProps = {
  isAllAssetsLoading: boolean
  rootBalanceStore: RootBalanceStore
  rootCW20DenomsStore: RootCW20DenomsStore
  rootDenomsStore: RootDenomsStore
  rootERC20DenomsStore: RootERC20DenomsStore
  evmBalanceStore: EvmBalanceStore
  resetForm: boolean
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
  }: AmountCardProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const locationState = useLocation().state
    const activeChain = useActiveChain()
    const chainInfos = chainInfoStore.chainInfos
    const selectedNetwork = useSelectedNetwork()

    const [showTokenSelectSheet, setShowTokenSelectSheet] = useState<boolean>(false)
    const [amount, setAmount] = useState('')
    const [isInputInUSDC, setIsInputInUSDC] = useState<boolean>(false)
    const allCW20Denoms = rootCW20DenomsStore.allCW20Denoms
    const allERC20Denoms = rootERC20DenomsStore.allERC20Denoms
    const { getAggregatedSpendableBalances } = rootBalanceStore

    const isCW20Token = useCallback(
      (token: Token) => {
        if (!token) {
          return false
        }
        return Object.keys(allCW20Denoms).includes(token.coinMinimalDenom)
      },
      [allCW20Denoms],
    )

    const assetCoinDenom = useQuery().get('assetCoinDenom') ?? undefined
    const chainId = useQuery().get('chainId') ?? undefined

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
      setGasError,
      hasToUsePointerLogic,
    } = useSendContext()

    const gasAdjustment = useGasAdjustmentForChain()
    const evmBalance = evmBalanceStore.evmBalance

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

    const allAssets = getAggregatedSpendableBalances(selectedNetwork)
    const assets = useMemo(() => {
      const _assets = allAssets

      return _assets.sort((a, b) => Number(b.usdValue) - Number(a.usdValue))
    }, [allAssets])

    const isTokenStatusSuccess = useMemo(() => {
      let status = isAllAssetsLoading === false
      const addEvmDetails = chainInfos?.[sendActiveChain]?.evmOnlyChain ?? false

      if (addEvmDetails) {
        status = status && evmBalance.status === 'success'
      }
      return status
    }, [chainInfos, evmBalance.status, isAllAssetsLoading, sendActiveChain])

    const updateSelectedToken = useCallback(
      (token: Token | null) => {
        setSelectedToken(token)
        setSelectedChain(token?.tokenBalanceOnChain || null)

        if (token && token?.isEvm) {
          setFeeDenom({
            coinMinimalDenom: token.coinMinimalDenom,
            coinDecimals: token.coinDecimals ?? 6,
            coinDenom: token.symbol,
            icon: token.img,
            coinGeckoId: token.coinGeckoId ?? '',
            chain: token.chain ?? '',
          })
        }

        if (token && (activeChain as AggregatedSupportedChain) === AGGREGATED_CHAIN_KEY) {
          const _token =
            Object.values(
              chainInfos[token.tokenBalanceOnChain as SupportedChain]?.nativeDenoms,
            )?.[0] || token

          setFeeDenom({
            coinMinimalDenom: _token.coinMinimalDenom,
            coinDecimals: _token.coinDecimals ?? 6,
            coinDenom: _token.coinDenom || token.symbol,
            icon: _token.icon || token.img,
            coinGeckoId: _token.coinGeckoId ?? '',
            chain: _token.chain ?? '',
          })
        }
      },
      [setSelectedToken, activeChain, setSelectedChain, setFeeDenom, chainInfos],
    )

    useEffect(() => {
      if (!selectedToken && !assetCoinDenom && isTokenStatusSuccess) {
        if (locationState && (locationState as Token).coinMinimalDenom) {
          const token = locationState as Token
          updateSelectedToken(token)
        }
      }
    }, [
      assets,
      locationState,
      isTokenStatusSuccess,
      selectedToken,
      updateSelectedToken,
      assetCoinDenom,
      selectedChain,
    ])

    useEffect(() => {
      if (assetCoinDenom) {
        const tokenFromParams: Token | null =
          assets.find(
            (asset) =>
              asset.ibcDenom === assetCoinDenom || asset.coinMinimalDenom === assetCoinDenom,
          ) || null

        updateSelectedToken(tokenFromParams)
      } else if (chainId) {
        const tokenFromParams: Token | null =
          assets.find((asset) => new BigNumber(asset.amount).gt(0)) || null
        updateSelectedToken(tokenFromParams)
      }
    }, [chainId, assetCoinDenom, activeChain, assets, updateSelectedToken])

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
    ])

    useEffect(() => {
      if (resetForm) {
        setAmount('')
        setSelectedToken((selectedToken) => {
          const match = assets.find(
            (asset) => asset.coinMinimalDenom === selectedToken?.coinMinimalDenom,
          )
          return match ?? selectedToken
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

        <SelectTokenSheet
          denoms={rootDenomsStore.allDenoms}
          isOpen={showTokenSelectSheet}
          assets={assets}
          selectedToken={selectedToken}
          onClose={() => {
            setShowTokenSelectSheet(false)
          }}
          onTokenSelect={(token) => {
            updateSelectedToken(token)
            setGasError('')
            setAmount('')
            inputRef.current?.focus()
          }}
          assetCoinDenom={assetCoinDenom}
        />
      </motion.div>
    )
  },
)

AmountCard.displayName = 'AmountCard'
