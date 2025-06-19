/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  hasToAddEvmDetails,
  Token,
  useGasAdjustmentForChain,
  useSeiLinkedAddressState,
  useSnipGetSnip20TokenBalances,
} from '@leapwallet/cosmos-wallet-hooks'
import { isValidAddressWithPrefix, SolanaTx, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  EvmBalanceStore,
  RootBalanceStore,
  RootCW20DenomsStore,
  RootDenomsStore,
  RootERC20DenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import { AptosCoinDataStore } from '@leapwallet/cosmos-wallet-store/dist/bank/aptos-balance-store'
import { useQuery as useRouterQuery } from '@tanstack/react-query'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import { calculateFeeAmount } from 'components/gas-price-options'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { motion } from 'framer-motion'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useChainInfos } from 'hooks/useChainInfos'
import useQuery from 'hooks/useQuery'
import { observer } from 'mobx-react-lite'
import { useSendContext } from 'pages/send-v2/context'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { selectedNetworkStore } from 'stores/selected-network-store'
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
  aptosCoinDataStore: AptosCoinDataStore
}

export const AmountCard = observer(
  ({
    isAllAssetsLoading,
    rootBalanceStore,
    rootDenomsStore,
    rootCW20DenomsStore,
    rootERC20DenomsStore,
    evmBalanceStore,
    aptosCoinDataStore,
  }: AmountCardProps) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const locationState = useLocation().state
    const activeChain = useActiveChain()
    const chainInfos = useChainInfos()

    const [showTokenSelectSheet, setShowTokenSelectSheet] = useState<boolean>(false)
    const [amount, setAmount] = useState('')
    const [isInputInUSDC, setIsInputInUSDC] = useState<boolean>(false)

    const { addressLinkState } = useSeiLinkedAddressState()
    const { snip20Tokens } = useSnipGetSnip20TokenBalances()
    const allCW20Denoms = rootCW20DenomsStore.allCW20Denoms
    const allERC20Denoms = rootERC20DenomsStore.allERC20Denoms

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
      addressWarning,
      setGasError,
    } = useSendContext()

    const gasAdjustment = useGasAdjustmentForChain()
    const evmBalance = evmBalanceStore.evmBalance
    const aptosBalance = aptosCoinDataStore.balances

    function getFlooredFixed(v: number, d: number) {
      return (Math.floor(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d)
    }

    const { data: minimumRentAmount } = useRouterQuery(
      ['minimum-rent-amount', selectedAddress?.address, sendActiveChain, selectedToken?.chain],
      async () => {
        if (selectedToken?.chain === 'solana' && sendActiveChain === 'solana') {
          const solanaTx = await SolanaTx.getSolanaClient(
            chainInfos?.[sendActiveChain]?.apis?.rpc ?? '',
            undefined,
            selectedNetworkStore.selectedNetwork,
            sendActiveChain,
          )
          return await solanaTx.getMinimumRentAmount(selectedAddress?.address ?? '')
        }
        return 0
      },
    )

    useEffect(() => {
      const amountDecimals = amount.split('.')?.[1]?.length
      const coinDecimals = selectedToken?.coinDecimals ?? 6
      if (amountDecimals > coinDecimals) {
        setInputAmount(getFlooredFixed(Number(amount), coinDecimals) as string)
      } else {
        setInputAmount(amount)
      }
    }, [amount, selectedToken?.coinDecimals])

    const isSecretChainTargetAddress = useMemo(
      () => selectedAddress && isValidAddressWithPrefix(selectedAddress.address ?? '', 'secret'),
      [selectedAddress],
    )

    const allAssets = rootBalanceStore.allSpendableTokens
    const assets = useMemo(() => {
      let _assets = allAssets

      if (snip20Tokens && isSecretChainTargetAddress) {
        _assets = [..._assets, ...snip20Tokens]
      }

      const addEvmDetails =
        (activeChain as AggregatedSupportedChain) === AGGREGATED_CHAIN_KEY
          ? false
          : hasToAddEvmDetails(
              false,
              addressLinkState,
              chainInfos?.[sendActiveChain]?.evmOnlyChain ?? false,
            )

      if (addEvmDetails) {
        _assets = [..._assets, ...(evmBalance.evmBalance ?? [])].filter((token) =>
          new BigNumber(token.amount).gt(0),
        )
      }

      return (activeChain as AggregatedSupportedChain) === AGGREGATED_CHAIN_KEY
        ? _assets.sort((a, b) => Number(b.usdValue) - Number(a.usdValue))
        : _assets
    }, [
      activeChain,
      addressLinkState,
      allAssets,
      chainInfos,
      evmBalance.evmBalance,
      isSecretChainTargetAddress,
      sendActiveChain,
      snip20Tokens,
    ])

    const isTokenStatusSuccess = useMemo(() => {
      let status = isAllAssetsLoading === false
      const addEvmDetails = hasToAddEvmDetails(
        false,
        addressLinkState,
        chainInfos?.[sendActiveChain]?.evmOnlyChain ?? false,
      )

      if (addEvmDetails) {
        status = status && evmBalance.status === 'success'
      }
      return status
    }, [addressLinkState, chainInfos, evmBalance.status, isAllAssetsLoading, sendActiveChain])

    const updateSelectedToken = useCallback(
      (token: Token | null) => {
        setSelectedToken(token)

        if ((activeChain as AggregatedSupportedChain) === AGGREGATED_CHAIN_KEY) {
          setSelectedChain(token?.tokenBalanceOnChain || null)
        } else {
          setSelectedChain(null)
        }

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
        } else if (assets.length > 0) {
          const tokensWithBalance = assets.filter((token) => new BigNumber(token.amount).gt(0))
          const token = tokensWithBalance[0] as Token
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
    ])

    useEffect(() => {
      if (addressLinkState === 'done' && selectedToken && selectedToken?.isEvm) {
        const tokensWithBalance = assets.filter((token) => new BigNumber(token.amount).gt(0))
        const token = tokensWithBalance[0] as Token
        updateSelectedToken(token)
      }
    }, [addressLinkState, assets, selectedToken, updateSelectedToken])

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
      if (addressWarning.type === 'link') {
        setInputAmount('0.0001')
        return
      }
    }, [addressWarning])

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
          selectedToken?.chain === 'solana' &&
          selectedToken?.coinMinimalDenom === 'lamports' &&
          sendActiveChain === 'solana'
        ) {
          if (minimumRentAmount > Number(inputAmount)) {
            return `A minimum of ${minimumRentAmount} SOL is required`
          }
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
      minimumRentAmount,
    ])

    return (
      <motion.div
        className={classNames({ 'opacity-50 pointer-events-none': addressWarning.type === 'link' })}
        style={{ overflow: 'hidden' }}
      >
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
        />

        <SelectTokenSheet
          denoms={rootDenomsStore.allDenoms}
          isOpen={showTokenSelectSheet}
          assets={assets}
          selectedToken={selectedToken as Token}
          onClose={() => {
            setShowTokenSelectSheet(false)
          }}
          onTokenSelect={(token) => {
            updateSelectedToken(token)
            setGasError('')
            setAmount('')
            inputRef.current?.focus()
          }}
        />
      </motion.div>
    )
  },
)

AmountCard.displayName = 'AmountCard'
