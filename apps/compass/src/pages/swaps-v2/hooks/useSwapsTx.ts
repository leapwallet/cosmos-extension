/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  currencyDetail,
  fetchCurrency,
  GasOptions,
  getKeyToUseForDenoms,
  Token,
  useChainInfo,
  useFeatureFlags,
  useformatCurrency,
  useGasAdjustmentForChain,
  useNativeFeeDenom,
  useUserPreferredCurrency,
  useWalletIdentifications,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  DefaultGasEstimates,
  GasPrice,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import {
  ActiveChainStore,
  AutoFetchedCW20DenomsStore,
  BetaCW20DenomsStore,
  BetaERC20DenomsStore,
  CompassSeiTokensAssociationStore,
  CompassTokenTagsStore,
  CW20DenomBalanceStore,
  CW20DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
  ERC20DenomsStore,
  PriceStore,
  RootBalanceStore,
  RootDenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import {
  RouteAggregator,
  RouteResponse,
  SkipCosmosMsg,
  SkipMsg,
  SkipMsgV2,
  TransactionRequestType,
  useAggregatorMessagesSWR,
  useDebouncedValue,
  useFeeAddresses,
  useFees,
  UseRouteResponse,
} from '@leapwallet/elements-hooks'
import { QueryStatus, useQuery as reactUseQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { calculateFeeAmount, useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { AGGREGATED_CHAIN_KEY, LEAPBOARD_SWAP_URL } from 'config/constants'
import { useNonNativeCustomChains } from 'hooks'
import { useChainInfos } from 'hooks/useChainInfos'
import useQuery from 'hooks/useQuery'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { evmBalanceStore } from 'stores/balance-store'
import { chainInfoStore } from 'stores/chain-infos-store'
import { SourceChain, SourceToken, SwapFeeInfo } from 'types/swap'
import { isCompassWallet } from 'utils/isCompassWallet'

import { findMinAsset } from '../utils'
import {
  useAddresses,
  useGetChainsToShow,
  useGetErrorMsg,
  useGetInfoMsg,
  useGetSwapAssets,
  useProviderFeatureFlags,
} from './index'
import { useAggregatorGasFeeSWR } from './useAggregatorGasFee'
import useAssets from './useAssets'
import { useEnableToken } from './useEnableToken'
import { useFeeAffiliates } from './useFeeAffiliates'
import { LifiRouteOverallResponse, SkipRouteResponse, useAggregatedRoute } from './useRoute'
import { useSwapVenues } from './useSwapVenues'
import { useTokenWithBalances } from './useTokenWithBalances'

export type SkipCosmosMsgWithCustomTxHash = SkipCosmosMsg & {
  customTxHash?: string
  customMessageChainId?: string
}

export type SkipMsgWithCustomTxHash = (SkipMsgV2 | SkipMsg) & {
  customTxHash?: string
  customMessageChainId?: string
}

export type LifiMsgWithCustomTxHash = TransactionRequestType & {
  customTxHash?: string
  customMessageChainId?: string
}

export type RoutingInfo =
  | {
      aggregator: RouteAggregator.LIFI
      route: LifiRouteOverallResponse | undefined
      messages: LifiMsgWithCustomTxHash[] | undefined
      userAddresses: string[] | null
    }
  | {
      aggregator: RouteAggregator.SKIP
      route: SkipRouteResponse | undefined
      messages: SkipMsgWithCustomTxHash[] | undefined
      userAddresses: string[] | null
    }

export type SwapsTxType = {
  inAmount: string
  debouncedInAmount: string
  sourceToken: SourceToken | null
  sourceChain: SourceChain | undefined
  handleInAmountChange: (value: string) => void
  loadingSourceAssets: boolean
  sourceTokenBalanceStatus: QueryStatus
  sourceAssets: SourceToken[]
  chainsToShow: SourceChain[]
  loadingChains: boolean
  amountExceedsBalance: boolean
  invalidAmount: boolean
  amountOut: string
  destinationToken: SourceToken | null
  destinationTokenBalancesStatus: QueryStatus
  destinationChain: SourceChain | undefined
  loadingDestinationAssets: boolean
  destinationAssets: SourceToken[]
  loadingRoutes?: boolean
  loadingMessages?: boolean
  errorMsg: string
  loadingMsg: string
  reviewBtnDisabled: boolean
  setSourceToken: React.Dispatch<React.SetStateAction<SourceToken | null>>
  setDestinationToken: React.Dispatch<React.SetStateAction<SourceToken | null>>
  setSourceChain: (value: SourceChain | undefined) => void
  setDestinationChain: (value: SourceChain | undefined) => void
  callbackPostTx: () => void
  infoMsg: string
  redirectUrl: string
  isMoreThanOneStepTransaction: boolean
  gasError: string | null
  setGasError: React.Dispatch<React.SetStateAction<string | null>>
  feeDenom: NativeDenom & { ibcDenom?: string }
  userPreferredGasLimit: number | undefined
  userPreferredGasPrice: GasPrice | undefined
  gasOption: GasOptions
  gasEstimate: number
  gasPriceOption: GasPriceOptionValue
  setGasPriceOption: React.Dispatch<React.SetStateAction<GasPriceOptionValue>>
  setUserPreferredGasLimit: React.Dispatch<React.SetStateAction<number | undefined>>
  setUserPreferredGasPrice: React.Dispatch<React.SetStateAction<GasPrice | undefined>>
  setGasOption: React.Dispatch<React.SetStateAction<GasOptions>>
  setFeeDenom: React.Dispatch<
    React.SetStateAction<
      NativeDenom & {
        ibcDenom?: string | undefined
      }
    >
  >
  displayFee: {
    value: number
    formattedAmount: string
    feeDenom: NativeDenom & { ibcDenom?: string }
    fiatValue: string
  }
  isSkipGasFeeLoading: boolean
  routingInfo: RoutingInfo
  refresh: () => Promise<void>
  handleSwitchOrder: () => void
  isSwitchOrderPossible: boolean
  slippagePercent: number
  setSlippagePercent: React.Dispatch<React.SetStateAction<number>>
  setInAmount: React.Dispatch<React.SetStateAction<string>>
  refetchSourceBalances: (() => void) | undefined
  refetchDestinationBalances: (() => void) | undefined
  usdValueAvailableForPair: boolean | undefined
  leapFeeBps: string
  isSwapFeeEnabled: boolean
  swapFeeInfo?: SwapFeeInfo
  isSanctionedAddressPresent: boolean
  isChainAbstractionView: boolean
}

export const SWAP_NETWORK = 'mainnet'
const SEIYAN_TOKEN_DENOMS = [
  'sei1hrndqntlvtmx2kepr0zsfgr7nzjptcc72cr4ppk4yav58vvy7v3s4er8ed',
  '0x5f0E07dFeE5832Faa00c63F2D33A0D79150E8598',
]
const SEI_TOKEN_DENOMS = ['usei']

export function useSwapsTx({
  rootDenomsStore,
  rootBalanceStore,
  activeChainStore,
  autoFetchedCW20DenomsStore,
  betaCW20DenomsStore,
  cw20DenomsStore,
  disabledCW20DenomsStore,
  enabledCW20DenomsStore,
  cw20DenomBalanceStore,
  erc20DenomsStore,
  betaERC20DenomsStore,
  compassTokenTagsStore,
  compassTokensAssociationsStore,
  priceStore,
}: {
  rootDenomsStore: RootDenomsStore
  rootBalanceStore: RootBalanceStore
  activeChainStore: ActiveChainStore
  autoFetchedCW20DenomsStore: AutoFetchedCW20DenomsStore
  betaCW20DenomsStore: BetaCW20DenomsStore
  cw20DenomsStore: CW20DenomsStore
  disabledCW20DenomsStore: DisabledCW20DenomsStore
  enabledCW20DenomsStore: EnabledCW20DenomsStore
  cw20DenomBalanceStore: CW20DenomBalanceStore
  erc20DenomsStore: ERC20DenomsStore
  betaERC20DenomsStore: BetaERC20DenomsStore
  compassTokenTagsStore: CompassTokenTagsStore
  compassTokensAssociationsStore: CompassSeiTokensAssociationStore
  priceStore: PriceStore
}): SwapsTxType {
  const denoms = rootDenomsStore.allDenoms
  const { data: featureFlags } = useFeatureFlags()
  const isChainAbstractionView = useMemo(
    () => featureFlags?.swaps?.chain_abstraction === 'active',
    [featureFlags],
  )
  const { getLoadingStatusForChain, getSpendableBalancesForChain, getAggregatedSpendableBalances } =
    rootBalanceStore
  const activeChain = activeChainStore.activeChain
  const activeChainInfo = useChainInfo(
    activeChain === AGGREGATED_CHAIN_KEY ? 'osmosis' : activeChain,
  )
  const chainInfos = useChainInfos()
  const [preferredCurrency] = useUserPreferredCurrency()
  const [formatCurrency] = useformatCurrency()
  const isSwitchedRef = useRef(false)
  const { data: feeValues } = useFees()
  const { data: leapFeeAddresses } = useFeeAddresses()
  const { data: swapVenue } = useSwapVenues()
  const { isEvmSwapEnabled } = useProviderFeatureFlags()
  /**
   * states for chain, token and amount
   */
  const [sourceChain, setSourceChain] = useState<SourceChain>()
  const [sourceToken, setSourceToken] = useState<SourceToken | null>(null)
  const [inAmount, setInAmount] = useState('')
  const [destinationChain, setDestinationChain] = useState<SourceChain>()
  const [destinationToken, setDestinationToken] = useState<SourceToken | null>(null)
  const [slippagePercent, setSlippagePercent] = useState(0.5)

  const searchedAssetsSetRef = useRef({
    sourceChain: false,
    destinationChain: false,
    sourceToken: false,
    destinationToken: false,
  })
  const sourceTokenNotYetSelectedRef = useRef<boolean>(false)
  const destinationTokenNotYetSelectedRef = useRef<boolean>(false)
  const prevSourceChain = useRef<SupportedChain | undefined>()

  /**
   * custom hooks
   */

  const sourceAddressIdentifications = useWalletIdentifications(sourceChain?.key as SupportedChain)

  const destinationAddressIdentifications = useWalletIdentifications(
    destinationChain?.key as SupportedChain,
  )

  const isSanctionedAddressPresent = useMemo(() => {
    if (!sourceAddressIdentifications.isLoading && !destinationAddressIdentifications.isLoading) {
      if (sourceAddressIdentifications.data?.identifications) {
        return sourceAddressIdentifications.data?.identifications.length > 0
      }
      if (destinationAddressIdentifications.data?.identifications) {
        return destinationAddressIdentifications.data?.identifications.length > 0
      }
      return false
    }
    return false
  }, [sourceAddressIdentifications, destinationAddressIdentifications])

  const debouncedInAmount = useDebouncedValue(inAmount, 500)
  const { chainsToShow, chainsToShowLoading } = useGetChainsToShow()

  const customChains = useNonNativeCustomChains()

  const aggregatedSourceTokens = getAggregatedSpendableBalances(SWAP_NETWORK)
  const aggregatedSourceChainTokens = useMemo(() => {
    const chainToShowKeys = chainsToShow.map((chain) => chain.key)
    const allChainsInfo = Object.values({ ...customChains, ...chainInfoStore.chainInfos })?.filter(
      (chainInfo) => chainToShowKeys.includes(chainInfo.key),
    )
    const nonIncludedChainsInfo = allChainsInfo
    const chainsWithBalances = new Set<SupportedChain>([])
    aggregatedSourceTokens.forEach((token) => {
      if (token.tokenBalanceOnChain) {
        chainsWithBalances.add(token.tokenBalanceOnChain)
      }
    })
    const chainsToAppend = nonIncludedChainsInfo.filter(
      (chainInfo) => !chainsWithBalances.has(chainInfo.key),
    )
    const emptyNativeTokensToAppend: Token[] = chainsToAppend.flatMap((chainInfo) => {
      return Object.values(chainInfo.nativeDenoms).map((denom): Token => {
        return {
          ...denom,
          symbol: denom.name ?? denom.coinDenom,
          img: denom.icon,
          amount: '0',
          chain: denom.chain ?? chainInfo.key,
          tokenBalanceOnChain: chainInfo.key,
        }
      })
    })
    return emptyNativeTokensToAppend.concat(aggregatedSourceTokens)
  }, [aggregatedSourceTokens, chainsToShow, customChains])

  const sourceChainTokens = isChainAbstractionView
    ? aggregatedSourceChainTokens
    : sourceChain
    ? getSpendableBalancesForChain(sourceChain?.key, SWAP_NETWORK) ?? []
    : []

  const destinationChainTokens = isChainAbstractionView
    ? getAggregatedSpendableBalances(SWAP_NETWORK)
    : destinationChain
    ? getSpendableBalancesForChain(destinationChain?.key, SWAP_NETWORK) ?? []
    : []

  const sourceTokensLoading = sourceChain
    ? getLoadingStatusForChain(sourceChain?.key, SWAP_NETWORK) ||
      evmBalanceStore.evmBalance.status === 'loading'
    : false

  const destinationTokensLoading = destinationChain
    ? getLoadingStatusForChain(destinationChain?.key, SWAP_NETWORK) ||
      evmBalanceStore.evmBalance.status === 'loading'
    : false

  const combinedDenoms = useMemo(() => {
    return Object.assign({}, denoms, compassTokenTagsStore.compassTokenDenomInfo)
  }, [compassTokenTagsStore?.compassTokenDenomInfo, denoms])

  useEffect(() => {
    if (sourceChain && sourceChainTokens?.length === 0) {
      rootBalanceStore.loadBalances(sourceChain.key, SWAP_NETWORK)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceChain])

  useEffect(() => {
    if (destinationChain && destinationChainTokens?.length === 0) {
      rootBalanceStore.loadBalances(destinationChain.key, SWAP_NETWORK)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationChain])

  const { data: mergedAssets } = useAssets()
  const { data: sourceAssetsData, isLoading: loadingSourceAssets } = useGetSwapAssets(
    combinedDenoms,
    priceStore.data,
    sourceChainTokens,
    isChainAbstractionView ? rootBalanceStore.allAggregatedTokensLoading : sourceTokensLoading,
    sourceChain,
    mergedAssets,
    true,
    isChainAbstractionView,
    chainsToShow,
  )

  const { data: destinationAssetsData, isLoading: loadingDestinationAssets } = useGetSwapAssets(
    combinedDenoms,
    priceStore.data,
    destinationChainTokens,
    isChainAbstractionView ? rootBalanceStore.allAggregatedTokensLoading : destinationTokensLoading,
    destinationChain,
    mergedAssets,
    false,
    isChainAbstractionView,
    chainsToShow,
  )

  const refetchSourceBalances = useCallback(() => {
    if (sourceChain?.key) {
      rootBalanceStore.refetchBalances(sourceChain.key)
    }
  }, [rootBalanceStore, sourceChain?.key])

  const refetchDestinationBalances = useCallback(() => {
    if (destinationChain?.key) {
      rootBalanceStore.refetchBalances(destinationChain.key)
    }
  }, [rootBalanceStore, destinationChain?.key])

  /**
   * states for fee
   */
  const [gasError, setGasError] = useState<string | null>(null)
  const [gasOption, setGasOption] = useState<GasOptions>(GasOptions.LOW)
  const [userPreferredGasPrice, setUserPreferredGasPrice] = useState<GasPrice | undefined>(
    undefined,
  )
  const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<number | undefined>(undefined)

  const defaultGasPrice = useDefaultGasPrice(denoms, {
    activeChain: sourceChain?.key ?? 'cosmos',
  })

  const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
    option: gasOption,
    gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
  })

  const nativeFeeDenom = useNativeFeeDenom(denoms, sourceChain?.key ?? 'cosmos', SWAP_NETWORK)
  const [feeDenom, setFeeDenom] = useState<NativeDenom & { ibcDenom?: string }>(nativeFeeDenom)
  const gasAdjustment = useGasAdjustmentForChain(sourceChain?.key ?? '')

  const searchedSourceChain = useQuery().get('sourceChainId') ?? undefined
  const searchedDestinationChain = useQuery().get('destinationChainId') ?? undefined
  const _searchedSourceToken = useQuery().get('sourceToken') ?? undefined
  const _searchedDestinationToken = useQuery().get('destinationToken') ?? undefined
  const searchedSourceToken =
    _searchedSourceToken === 'wei' ? 'ethereum-native' : _searchedSourceToken
  const searchedDestinationToken =
    _searchedDestinationToken === 'wei' ? 'ethereum-native' : _searchedDestinationToken

  const isRouteQueryEnabled = useMemo(() => {
    if (!sourceChain || !destinationChain || !sourceToken || !destinationToken) return false
    if (
      sourceChain.chainId === destinationChain.chainId &&
      sourceToken?.skipAsset?.denom === destinationToken?.skipAsset?.denom
    ) {
      return false
    }
    if (!debouncedInAmount || Number(debouncedInAmount) <= 0) return false
    return true
  }, [debouncedInAmount, destinationChain, destinationToken, sourceChain, sourceToken])

  const isSwapFeeEnabled = useMemo(() => {
    if (!featureFlags) return false
    return featureFlags.swaps.fees === 'active'
  }, [featureFlags])

  const compassDefaultToken = useMemo(() => {
    if (!featureFlags) return []
    return featureFlags.swaps.default_token_denoms ?? SEIYAN_TOKEN_DENOMS
  }, [featureFlags])

  /**
   * Function to enable a disabled token
   */
  const { enableToken: enableSourceToken } = useEnableToken(
    sourceChain,
    sourceToken,
    autoFetchedCW20DenomsStore,
    betaCW20DenomsStore,
    cw20DenomsStore,
    disabledCW20DenomsStore,
    enabledCW20DenomsStore,
    erc20DenomsStore,
    betaERC20DenomsStore,
    rootBalanceStore,
    compassTokensAssociationsStore,
    rootDenomsStore,
  )
  const { enableToken: enableDestinationToken } = useEnableToken(
    destinationChain,
    destinationToken,
    autoFetchedCW20DenomsStore,
    betaCW20DenomsStore,
    cw20DenomsStore,
    disabledCW20DenomsStore,
    enabledCW20DenomsStore,
    erc20DenomsStore,
    betaERC20DenomsStore,
    rootBalanceStore,
    compassTokensAssociationsStore,
    rootDenomsStore,
  )

  const callbackPostTx = useCallback(() => {
    enableDestinationToken()
    enableSourceToken()
  }, [enableDestinationToken, enableSourceToken])

  /**
   * set source chain and destination chain
   */
  useEffect(() => {
    if (chainsToShow.length > 0 && (!sourceChain || !destinationChain)) {
      const sourceChainParams = chainsToShow.find(
        (chain) => chain.chainId === searchedSourceChain && chain.enabled,
      )

      const destinationChainParams = chainsToShow.find(
        (chain) => chain.chainId === searchedDestinationChain && chain.enabled,
      )

      const activeChainToShow = chainsToShow.find(
        (chain) => chain.chainId === activeChainInfo.chainId && chain.enabled,
      )

      const firstNotActiveChainToShow = chainsToShow.find((chain) => {
        if (isCompassWallet()) return false
        /**
         * If active chain is Osmosis, set Cosmos as the starting destination chain
         */
        if (activeChainInfo.chainId === chainInfos.osmosis.chainId) {
          if (chain.chainId === chainInfos.cosmos.chainId) {
            return true
          }

          return false
        }

        /**
         * Else, set Osmosis as the starting destination chain
         */
        return chain.chainId === chainInfos.osmosis.chainId
      })

      if (sourceChainParams && !searchedAssetsSetRef.current.sourceChain) {
        setSourceChain(sourceChainParams)
        searchedAssetsSetRef.current.sourceChain = true
      } else if (activeChainToShow) {
        setSourceChain(activeChainToShow)
      } else {
        const chainToSet = chainsToShow?.find((chain) => chain.enabled)
        if (chainsToShow) {
          setSourceChain(chainToSet)
        }
      }
      sourceTokenNotYetSelectedRef.current = true
      if (destinationChainParams && !searchedAssetsSetRef.current.destinationChain) {
        setDestinationChain(destinationChainParams)
        searchedAssetsSetRef.current.destinationChain = true
      } else if (firstNotActiveChainToShow) {
        setDestinationChain(firstNotActiveChainToShow)
      } else {
        if (isCompassWallet()) {
          setDestinationChain(chainsToShow[0])
        } else {
          const chainToSet = chainsToShow?.filter((chain) => chain.enabled)?.[1]
          if (chainsToShow) {
            setDestinationChain(chainToSet)
          }
        }
      }
      destinationTokenNotYetSelectedRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeChainInfo.chainId,
    chainsToShow,
    destinationChain,
    searchedDestinationChain,
    searchedSourceChain,
    sourceChain,
  ])

  /**
   * set source token
   */
  useEffect(() => {
    const customChainKeys = new Set(Object.values(customChains).map((chain) => chain.key))
    const sourceAssets = (sourceAssetsData?.assets ?? []).filter(
      (chain) => chain.tokenBalanceOnChain && !customChainKeys.has(chain.tokenBalanceOnChain),
    )

    if (sourceChain && sourceAssets && sourceAssets.length > 0 && !isSwitchedRef.current) {
      if (searchedSourceToken) {
        if (!searchedAssetsSetRef.current.sourceToken) {
          searchedAssetsSetRef.current.sourceToken = true
          const sourceToken = sourceAssets.find(
            (asset) =>
              asset.ibcDenom === searchedSourceToken ||
              (asset.skipAsset.evmTokenContract &&
                asset.skipAsset.evmTokenContract?.replace(/(cw20:|erc20\/)/g, '') ===
                  searchedSourceToken?.replace(/(cw20:|erc20\/)/g, '')) ||
              getKeyToUseForDenoms(asset.skipAsset.denom, asset.skipAsset.originChainId) ===
                searchedSourceToken?.replace(/(cw20:|erc20\/)/g, '') ||
              (getKeyToUseForDenoms(asset.skipAsset.originDenom, asset.skipAsset.originChainId) ===
                searchedSourceToken?.replace(/(cw20:|erc20\/)/g, '') &&
                !!searchedSourceChain &&
                asset.skipAsset.chainId === searchedSourceChain),
          )

          if (sourceToken) {
            sourceTokenNotYetSelectedRef.current = false
            setSourceToken(sourceToken)
            return
          }
        }
      }
      if (sourceTokenNotYetSelectedRef.current) {
        sourceTokenNotYetSelectedRef.current = false
        if (isChainAbstractionView) {
          const firstToken = sourceAssets?.[0]
          let highestBalanceToken = firstToken
          if (!firstToken?.amount || new BigNumber(firstToken.amount).isEqualTo(0)) {
            const tokenToPreselect = isCompassWallet()
              ? {
                  denom: 'usei',
                  chainId: 'pacific-1',
                }
              : {
                  denom: 'uatom',
                  chainId: 'cosmoshub-4',
                }
            highestBalanceToken =
              sourceAssets?.find(
                (token) =>
                  token.skipAsset?.denom === tokenToPreselect.denom &&
                  token.skipAsset?.chainId === tokenToPreselect.chainId,
              ) ?? firstToken
          }
          if (searchedDestinationToken) {
            const isSameTokenAsSearchedDestinationToken =
              highestBalanceToken.ibcDenom === searchedDestinationToken ||
              (highestBalanceToken.skipAsset.evmTokenContract &&
                highestBalanceToken.skipAsset.evmTokenContract?.replace(/(cw20:|erc20\/)/g, '') ===
                  searchedDestinationToken?.replace(/(cw20:|erc20\/)/g, '')) ||
              getKeyToUseForDenoms(
                highestBalanceToken.skipAsset.denom,
                highestBalanceToken.skipAsset.originChainId,
              ) === searchedDestinationToken?.replace(/(cw20:|erc20\/)/g, '') ||
              (getKeyToUseForDenoms(
                highestBalanceToken.skipAsset.originDenom,
                highestBalanceToken.skipAsset.originChainId,
              ) === searchedDestinationToken?.replace(/(cw20:|erc20\/)/g, '') &&
                !!searchedDestinationChain &&
                highestBalanceToken.skipAsset.chainId === searchedDestinationChain)

            if (isSameTokenAsSearchedDestinationToken) {
              highestBalanceToken =
                sourceAssets?.find(
                  (asset) =>
                    !(
                      asset.ibcDenom === searchedDestinationToken ||
                      (asset.skipAsset.evmTokenContract &&
                        asset.skipAsset.evmTokenContract?.replace(/(cw20:|erc20\/)/g, '') ===
                          searchedDestinationToken?.replace(/(cw20:|erc20\/)/g, '')) ||
                      getKeyToUseForDenoms(asset.skipAsset.denom, asset.skipAsset.originChainId) ===
                        searchedDestinationToken?.replace(/(cw20:|erc20\/)/g, '') ||
                      (getKeyToUseForDenoms(
                        asset.skipAsset.originDenom,
                        asset.skipAsset.originChainId,
                      ) === searchedDestinationToken?.replace(/(cw20:|erc20\/)/g, '') &&
                        !!searchedDestinationChain &&
                        asset.skipAsset.chainId === searchedDestinationChain)
                    ),
                ) ?? highestBalanceToken
            }
          }
          const _highestBalanceTokenChain = chainsToShow?.find(
            (chain) => chain.chainId === highestBalanceToken?.skipAsset.chainId,
          )
          if (highestBalanceToken && _highestBalanceTokenChain) {
            setSourceToken(highestBalanceToken)
            setSourceChain(_highestBalanceTokenChain)
            return
          }
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const baseDenomToSet = sourceChain.baseDenom ?? ''
        const sourceToken = sourceAssets.find((asset) =>
          !destinationChain ||
          destinationChain.chainId !== sourceChain.chainId ||
          !destinationToken ||
          destinationToken.coinMinimalDenom !== baseDenomToSet
            ? getKeyToUseForDenoms(asset.skipAsset.denom, asset.skipAsset.originChainId) ===
              getKeyToUseForDenoms(baseDenomToSet, sourceChain.chainId)
            : asset.coinMinimalDenom !== destinationToken.coinMinimalDenom,
        )

        if (sourceToken) {
          setSourceToken(sourceToken)
          return
        }

        const sourceChainAlternateToken = sourceAssets.find(
          (asset) => asset.skipAsset.chainId === sourceChain.chainId,
        )
        setSourceToken(sourceChainAlternateToken ?? sourceAssets[0])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceChain, sourceAssetsData?.assets, sourceAssetsData?.assets?.length, searchedSourceToken])

  /**
   * set destination token
   */
  useEffect(() => {
    const customChainKeys = new Set(Object.values(customChains).map((chain) => chain.key))
    const destinationAssets = (destinationAssetsData?.assets ?? []).filter(
      (chain) => chain.tokenBalanceOnChain && !customChainKeys.has(chain.tokenBalanceOnChain),
    )

    if (
      destinationChain &&
      destinationAssets &&
      destinationAssets.length > 0 &&
      !isSwitchedRef.current
    ) {
      if (searchedDestinationToken) {
        if (!searchedAssetsSetRef.current.destinationToken) {
          searchedAssetsSetRef.current.destinationToken = true
          const destinationToken = (destinationAssetsData?.assets ?? []).find(
            (asset) =>
              asset.ibcDenom === searchedDestinationToken ||
              (asset.skipAsset.evmTokenContract &&
                asset.skipAsset.evmTokenContract?.replace(/(cw20:|erc20\/)/g, '') ===
                  searchedDestinationToken?.replace(/(cw20:|erc20\/)/g, '')) ||
              getKeyToUseForDenoms(asset.skipAsset.denom, asset.skipAsset.originChainId) ===
                searchedDestinationToken?.replace(/(cw20:|erc20\/)/g, '') ||
              (getKeyToUseForDenoms(asset.skipAsset.originDenom, asset.skipAsset.originChainId) ===
                searchedDestinationToken?.replace(/(cw20:|erc20\/)/g, '') &&
                !!searchedDestinationChain &&
                asset.skipAsset.chainId === searchedDestinationChain),
          )

          if (destinationToken) {
            destinationTokenNotYetSelectedRef.current = false
            setDestinationToken(destinationToken)
            return
          }
        }
      }
      if (destinationTokenNotYetSelectedRef.current) {
        destinationTokenNotYetSelectedRef.current = false
        if (isCompassWallet()) {
          const defaultTokenDenoms = compassDefaultToken.some(
            (defaultToken) => searchedSourceToken?.replace(/(cw20:|erc20\/)/g, '') === defaultToken,
          )
            ? SEI_TOKEN_DENOMS
            : compassDefaultToken
          const destinationToken = destinationAssets.find(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            (asset) => {
              return defaultTokenDenoms.some(
                (defaultToken) =>
                  asset.coinMinimalDenom.toLowerCase() === defaultToken.toLowerCase(),
              )
            },
          )
          if (destinationToken) {
            setDestinationToken(destinationToken)
            return
          }
          setDestinationToken(destinationAssets[1])
          return
        }

        let highestBalanceToken: SourceToken | undefined
        let highestBalanceTokenChain: SourceChain | undefined
        if (isChainAbstractionView) {
          const firstToken = destinationAssets?.[0]
          highestBalanceToken = firstToken
          highestBalanceTokenChain = chainsToShow?.find(
            (chain) => chain.chainId === highestBalanceToken?.skipAsset.chainId,
          )
        }
        let chainToSet: SourceChain | undefined
        if (!!highestBalanceTokenChain && highestBalanceTokenChain.key === destinationChain.key) {
          chainToSet = chainsToShow?.find(
            (chain) => chain.key !== highestBalanceTokenChain?.key && chain.enabled,
          )
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const baseDenomToSet =
          (chainToSet ? chainToSet.baseDenom : destinationChain.baseDenom) ?? ''
        const _destinationChain = chainToSet ?? destinationChain
        const destinationToken = destinationAssets.find((asset) =>
          !sourceChain ||
          sourceChain.chainId !== _destinationChain.chainId ||
          !sourceToken ||
          sourceToken?.coinMinimalDenom !== baseDenomToSet
            ? getKeyToUseForDenoms(asset.skipAsset.denom, asset.skipAsset.originChainId) ===
              getKeyToUseForDenoms(baseDenomToSet, _destinationChain.chainId)
            : asset.coinMinimalDenom !== sourceToken.coinMinimalDenom,
        )

        if (destinationToken) {
          setDestinationToken(destinationToken)
          if (chainToSet) {
            setDestinationChain(chainToSet)
          }
          return
        }

        setDestinationToken(destinationAssets[0])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    destinationChain,
    destinationAssetsData?.assets,
    destinationAssetsData?.assets?.length,
    searchedDestinationToken,
  ])

  //TODO: Add better handling for this case: If movement chain is selected set the default token to a move token
  // useEffect(() => {
  //   if (sourceChain) {
  //     if (prevSourceChain.current === 'movement' && sourceChain.key !== 'movement') {
  //       setDestinationToken(null)
  //       setDestinationChain(undefined)
  //     }
  //     prevSourceChain.current = sourceChain.key
  //   }
  //
  //   if (sourceChain?.key === 'movement' && destinationAssetsData && sourceToken) {
  //     const destToken = destinationAssetsData?.assets.find(
  //       (asset) =>
  //         asset.chain === 'movement' && asset.coinMinimalDenom !== sourceToken.coinMinimalDenom,
  //     )
  //     if (!destToken) return
  //     setDestinationChain(sourceChain)
  //     setDestinationToken(destToken)
  //   }
  // }, [sourceChain, destinationAssetsData, sourceToken])

  const { data: sourceTokenWithBalance, status: sourceTokenWithBalanceStatus } =
    useTokenWithBalances(
      sourceToken,
      sourceChain,
      sourceAssetsData?.assets,
      loadingSourceAssets,
      autoFetchedCW20DenomsStore,
      betaCW20DenomsStore,
      cw20DenomsStore,
      disabledCW20DenomsStore,
      enabledCW20DenomsStore,
      cw20DenomBalanceStore,
      rootBalanceStore,
    )

  const { data: destinationTokenWithBalance, status: destinationTokenWithBalanceStatus } =
    useTokenWithBalances(
      destinationToken,
      destinationChain,
      destinationAssetsData?.assets,
      loadingDestinationAssets,
      autoFetchedCW20DenomsStore,
      betaCW20DenomsStore,
      cw20DenomsStore,
      disabledCW20DenomsStore,
      enabledCW20DenomsStore,
      cw20DenomBalanceStore,
      rootBalanceStore,
    )

  const leapFeeBps = useMemo(() => {
    if (!feeValues) return '75'
    const stableSwapPairs = feeValues.pairs as unknown as Record<string, number>
    const sourceTokenDenom = sourceToken?.skipAsset?.originDenom
    const destinationTokenDenom = destinationToken?.skipAsset?.originDenom
    if (!sourceTokenDenom || !destinationTokenDenom) return String(feeValues.default)

    const inOutKey = `${sourceTokenDenom}+${destinationTokenDenom}`
    const reverseInOutKey = `${destinationTokenDenom}+${sourceTokenDenom}`
    const feeBps = stableSwapPairs[inOutKey] ?? stableSwapPairs[reverseInOutKey]
    if (!feeBps) return String(feeValues.default)
    return String(feeBps)
  }, [feeValues, sourceToken, destinationToken])

  /**
   * element hooks
   */
  const {
    amountOut,
    routeResponse,
    routeError,
    isLoadingRoute: loadingRoutes,
    refresh,
    appliedLeapFeeBps,
  } = useAggregatedRoute({
    amountIn: debouncedInAmount,
    sourceAsset: sourceToken?.skipAsset,
    sourceAssetChain: sourceChain,
    destinationAsset: destinationToken?.skipAsset,
    destinationAssetChain: destinationChain,
    enabled: isRouteQueryEnabled,
    swapVenues: swapVenue,
    leapFeeBps: leapFeeBps,
    smartRelay: true,
    leapFeeAddresses,
    isSwapFeeEnabled,
    slippage: slippagePercent,
    enableSmartSwap: true,
    enableEvmSwap: isEvmSwapEnabled,
    enableGoFast: true,
  })

  const invalidAmount = useMemo(() => {
    return inAmount !== '' && (isNaN(Number(inAmount)) || Number(inAmount) < 0)
  }, [inAmount])

  const usdValueAvailableForPair = useMemo(() => {
    if (!routeResponse?.response) return undefined

    if (routeResponse.aggregator === RouteAggregator.SKIP) {
      return (
        routeResponse.response?.usd_amount_in !== undefined &&
        routeResponse.response?.usd_amount_out !== undefined
      )
    }
    if (routeResponse.aggregator === RouteAggregator.LIFI) {
      return (
        routeResponse.response?.fromAmountUSD !== undefined &&
        routeResponse.response?.toAmountUSD !== undefined
      )
    }

    return false
  }, [routeResponse?.aggregator, routeResponse?.response])

  const { userAddresses, userAddressesError, setUserAddressesError } = useAddresses(
    (routeResponse?.response as RouteResponse)?.chain_ids as string[],
  )

  useEffect(() => {
    setUserAddressesError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedInAmount,
    sourceToken,
    destinationToken,
    sourceChain,
    destinationChain,
    routeResponse,
  ])

  const { affiliates } = useFeeAffiliates(
    routeResponse as UseRouteResponse | undefined,
    appliedLeapFeeBps,
    undefined,
    isSwapFeeEnabled && routeResponse?.response?.does_swap,
  )

  const options = useMemo(() => {
    const queryOptions: any = {
      slippageTolerancePercent: String(slippagePercent),
    }
    if (affiliates) {
      queryOptions.chainIdsToAffiliates = affiliates
    }
    return queryOptions
  }, [slippagePercent, affiliates])

  const { data: messages, isLoading: loadingMessages } = useAggregatorMessagesSWR(
    userAddresses,
    routeResponse,
    options,
    !!routeResponse?.response,
  )
  const { data: skipGasFee, isLoading: isSkipGasFeeLoading } = useAggregatorGasFeeSWR(
    routeResponse,
    messages?.messages as TransactionRequestType[],
    userAddresses,
    sourceChain,
    true,
    undefined,
    !!messages || routeResponse?.aggregator !== RouteAggregator.SKIP,
  )

  const swapFeeInfo = useMemo(() => {
    if (!isSwapFeeEnabled || !messages || !routeResponse?.response) {
      return undefined
    }

    if (routeResponse.aggregator === RouteAggregator.LIFI) {
      const amount = routeResponse.response.toAmountMin
        ? Number(routeResponse.response.toAmountMin)
        : 0
      const lifiAsset = routeResponse.destinationAsset
      let feeAmountValue = null
      const feeCharged = Number(appliedLeapFeeBps) * 0.01
      const feeCollectionAddress = '0xd541efc525e625f5dc6651fe03ed5a36d155cb38' // TODO: Change this to env variable
      const leapFeePercentage = feeCharged / 100
      if (lifiAsset && amount > 0) {
        const minAssetAmount = new BigNumber(amount).dividedBy(
          10 ** Number(lifiAsset?.evmDecimals ?? lifiAsset?.decimals ?? 0),
        )
        feeAmountValue = minAssetAmount.multipliedBy(leapFeePercentage)
      }
      return {
        feeAmountValue,
        feeCharged,
        feeCollectionAddress,
        swapFeeDenomInfo: lifiAsset,
      }
    }

    let lastSwapVenue = routeResponse?.response?.swap_venue
    if (!lastSwapVenue) {
      lastSwapVenue =
        routeResponse?.response?.swap_venues?.[routeResponse?.response?.swap_venues?.length - 1]
    }
    const lastSwapVenueChainId = lastSwapVenue?.chain_id

    if (!mergedAssets || !routeResponse?.response?.does_swap || !lastSwapVenueChainId) {
      return undefined
    }

    const messageIndex = 0
    const messageObj = messages?.messages[messageIndex]
    let min_asset: any = null
    let amount = 0
    let denom = ''
    let feeAmountValue = null
    if ('multi_chain_msg' in messageObj) {
      const message = messageObj.multi_chain_msg
      const messageJson = JSON.parse(message.msg)
      if (messageJson?.memo) {
        const memoJson =
          typeof messageJson.memo === 'string' ? JSON.parse(messageJson.memo) : messageJson.memo
        min_asset = findMinAsset(memoJson)
      } else if (messageJson?.msg) {
        const msgJson =
          typeof messageJson.msg === 'string' ? JSON.parse(messageJson.msg) : messageJson.msg
        min_asset = findMinAsset(msgJson)
      }

      if (min_asset?.native) {
        amount = min_asset.native.amount
        denom = min_asset.native.denom
      } else if (min_asset?.cw20) {
        amount = min_asset.cw20.amount
        denom = min_asset.cw20.address
      }
    }

    const leapFeePercentage = (Number(appliedLeapFeeBps) * 0.01) / 100

    const skipAsset = mergedAssets[lastSwapVenueChainId ?? ''].find(
      (asset) => asset.denom.replace(/(cw20:|erc20\/)/g, '') === denom,
    )
    if (skipAsset && amount > 0) {
      const minAssetAmount = new BigNumber(amount).dividedBy(10 ** Number(skipAsset?.decimals ?? 0))
      feeAmountValue = minAssetAmount.multipliedBy(leapFeePercentage)
    }
    return {
      feeAmountValue: feeAmountValue ? feeAmountValue : null,
      feeCharged: Number(appliedLeapFeeBps) * 0.01,
      feeCollectionAddress:
        leapFeeAddresses && (leapFeeAddresses[lastSwapVenueChainId ?? ''] ?? ''),
      swapFeeDenomInfo: skipAsset,
    }
  }, [
    isSwapFeeEnabled,
    messages,
    routeResponse?.response,
    routeResponse?.aggregator,
    routeResponse?.destinationAsset,
    mergedAssets,
    appliedLeapFeeBps,
    leapFeeAddresses,
  ])

  const gasEstimate = useMemo(() => {
    if (skipGasFee && skipGasFee.gasFeesAmount) {
      if (isNaN(Number(skipGasFee.gasFeesAmount?.[0]?.gas))) {
        return DefaultGasEstimates.DEFAULT_GAS_TRANSFER
      } else {
        return Number(skipGasFee.gasFeesAmount?.[0]?.gas)
          ? Number(skipGasFee.gasFeesAmount[0].gas) / gasAdjustment
          : DefaultGasEstimates.DEFAULT_GAS_TRANSFER
      }
    }
    return DefaultGasEstimates.DEFAULT_GAS_TRANSFER
  }, [gasAdjustment, skipGasFee])

  /**
   * set fee denom
   */
  useEffect(() => {
    setFeeDenom(nativeFeeDenom)
  }, [nativeFeeDenom, sourceChain])

  /**
   * fetch fee token fiat value
   */
  const { data: feeTokenFiatValue } = reactUseQuery(
    ['fee-token-fiat-value', feeDenom],
    async () => {
      return fetchCurrency(
        '1',
        feeDenom.coinGeckoId,
        feeDenom.chain as SupportedChain,
        currencyDetail[preferredCurrency].currencyPointer,
        `${sourceChain?.chainId}-${feeDenom.coinMinimalDenom}`,
      )
    },
    { enabled: !!feeDenom },
  )

  /**
   * display fee on review tx sheet
   */
  const displayFee = useMemo(() => {
    if (!userPreferredGasPrice) {
      return {
        value: 0,
        formattedAmount: '',
        fiatValue: '',
        feeDenom,
      }
    }
    const { amount, formattedAmount } = calculateFeeAmount({
      gasPrice: userPreferredGasPrice.amount.toFloatApproximation(),
      gasLimit: userPreferredGasLimit ?? gasEstimate,
      feeDenom,
      gasAdjustment,
    })

    return {
      value: amount.toNumber(),
      formattedAmount: formattedAmount,
      feeDenom: feeDenom,
      fiatValue: feeTokenFiatValue ? formatCurrency(amount.multipliedBy(feeTokenFiatValue)) : '',
    }
  }, [
    feeDenom,
    feeTokenFiatValue,
    formatCurrency,
    gasAdjustment,
    gasEstimate,
    userPreferredGasLimit,
    userPreferredGasPrice,
  ])

  /**
   * loading, info and error messages
   */
  const isMoreThanOneStepTransaction = useMemo(() => {
    return (routeResponse?.transactionCount ?? 0) > 1
  }, [routeResponse?.transactionCount])

  const errorMsg = useGetErrorMsg(
    routeError,
    sourceToken,
    destinationToken,
    sourceChain,
    destinationChain,
    userAddressesError,
  )
  const loadingMsg = useMemo(() => {
    return loadingRoutes && inAmount && sourceToken ? 'Finding transaction routes' : ''
  }, [inAmount, loadingRoutes, sourceToken])

  const infoMsg = useGetInfoMsg(routeResponse?.transactionCount ?? 0)

  /**
   * redirect url
   */
  const redirectUrl = useMemo(() => {
    if (!sourceChain || !destinationChain || !sourceToken || !destinationToken) return ''

    return `${LEAPBOARD_SWAP_URL}&sourceChainId=${sourceChain.chainId}&destinationChainId=${destinationChain.chainId}&sourceAsset=${sourceToken?.coinMinimalDenom}&destinationAsset=${destinationToken?.coinMinimalDenom}`
  }, [destinationChain, destinationToken, sourceChain, sourceToken])

  /**
   * amount exceeds balance
   */
  const amountExceedsBalance = useMemo(() => {
    if (sourceTokenWithBalance && Number(inAmount) > Number(sourceTokenWithBalance.amount)) {
      return true
    }

    return false
  }, [inAmount, sourceTokenWithBalance])

  /**
   * review button disabled
   */
  const reviewBtnDisabled = useMemo(() => {
    return (
      !!gasError ||
      loadingDestinationAssets ||
      loadingSourceAssets ||
      loadingRoutes ||
      errorMsg !== '' ||
      Number(inAmount) <= 0 ||
      amountExceedsBalance ||
      invalidAmount ||
      sourceToken === null ||
      destinationToken === null ||
      !sourceChain ||
      !destinationChain ||
      inAmount === '' ||
      isSkipGasFeeLoading ||
      isSanctionedAddressPresent ||
      !skipGasFee ||
      !amountOut ||
      loadingMessages
    )
  }, [
    gasError,
    loadingDestinationAssets,
    loadingSourceAssets,
    loadingRoutes,
    errorMsg,
    inAmount,
    amountExceedsBalance,
    invalidAmount,
    sourceToken,
    destinationToken,
    sourceChain,
    destinationChain,
    isSkipGasFeeLoading,
    isSanctionedAddressPresent,
    skipGasFee,
    amountOut,
    loadingMessages,
  ])

  const isSwitchOrderPossible = useMemo(() => {
    return !!destinationToken
  }, [destinationToken])

  const handleSwitchOrder = useCallback(() => {
    if (isSwitchOrderPossible) {
      isSwitchedRef.current = true
      setSourceChain(destinationChain)
      setDestinationChain(sourceChain)
      setSourceToken(destinationToken)
      setDestinationToken(sourceToken)

      setTimeout(() => {
        isSwitchedRef.current = false
      }, 2000)
    } else {
      isSwitchedRef.current = false
    }
  }, [
    destinationChain,
    destinationToken,
    isSwitchOrderPossible,
    setDestinationChain,
    setDestinationToken,
    setSourceChain,
    setSourceToken,
    sourceChain,
    sourceToken,
  ])

  const handleInAmountChange = useCallback(
    (value: string) => {
      setInAmount(value)
    },
    [setInAmount],
  )

  const routingInfo: RoutingInfo = useMemo(() => {
    if (routeResponse?.aggregator === RouteAggregator.LIFI) {
      return {
        aggregator: RouteAggregator.LIFI,
        route: routeResponse,
        messages: messages?.messages as LifiMsgWithCustomTxHash[] | undefined,
        userAddresses: userAddresses,
      }
    }
    return {
      aggregator: RouteAggregator.SKIP,
      route: routeResponse,
      messages: messages?.messages as SkipMsgWithCustomTxHash[] | undefined,
      userAddresses: userAddresses,
    }
  }, [messages, routeResponse, userAddresses])

  const value = useMemo(() => {
    return {
      inAmount,
      debouncedInAmount,
      sourceToken: sourceTokenWithBalance,
      sourceTokenBalanceStatus: sourceTokenWithBalanceStatus,
      sourceChain,
      handleInAmountChange,
      sourceAssets: sourceAssetsData?.assets ?? [],
      loadingSourceAssets,
      chainsToShow,
      loadingChains: chainsToShowLoading,
      amountExceedsBalance,
      invalidAmount,
      amountOut,
      destinationToken: destinationTokenWithBalance,
      destinationChain,
      loadingDestinationAssets,
      destinationAssets: destinationAssetsData?.assets ?? [],
      loadingRoutes,
      loadingMessages,
      destinationTokenBalancesStatus: destinationTokenWithBalanceStatus,
      errorMsg,
      loadingMsg,
      reviewBtnDisabled,
      setSourceToken,
      setDestinationToken,
      setSourceChain: (value: SourceChain | undefined) => {
        sourceTokenNotYetSelectedRef.current = !isChainAbstractionView
        setSourceChain(value)
      },
      setDestinationChain: (value: SourceChain | undefined) => {
        destinationTokenNotYetSelectedRef.current = !isChainAbstractionView
        setDestinationChain(value)
      },
      infoMsg,
      redirectUrl,
      isMoreThanOneStepTransaction,
      gasPriceOption,
      setGasPriceOption,
      gasError,
      setGasError,
      feeDenom,
      userPreferredGasLimit,
      userPreferredGasPrice,
      isSkipGasFeeLoading,
      gasOption,
      gasEstimate,
      setUserPreferredGasLimit,
      setUserPreferredGasPrice,
      callbackPostTx,
      setGasOption,
      setFeeDenom,
      displayFee,
      routingInfo,
      refresh,
      handleSwitchOrder,
      isSwitchOrderPossible,
      slippagePercent,
      setSlippagePercent,
      setInAmount,
      usdValueAvailableForPair,
      refetchSourceBalances,
      refetchDestinationBalances,
      leapFeeBps: appliedLeapFeeBps,
      isSwapFeeEnabled,
      swapFeeInfo,
      isSanctionedAddressPresent,
      isChainAbstractionView,
    }
  }, [
    amountExceedsBalance,
    amountOut,
    callbackPostTx,
    chainsToShow,
    chainsToShowLoading,
    destinationAssetsData?.assets,
    destinationChain,
    destinationTokenWithBalance,
    destinationTokenWithBalanceStatus,
    displayFee,
    errorMsg,
    feeDenom,
    gasError,
    gasEstimate,
    gasOption,
    gasPriceOption,
    handleInAmountChange,
    handleSwitchOrder,
    inAmount,
    debouncedInAmount,
    infoMsg,
    invalidAmount,
    isMoreThanOneStepTransaction,
    isSkipGasFeeLoading,
    isSwitchOrderPossible,
    loadingDestinationAssets,
    loadingMsg,
    loadingRoutes,
    loadingSourceAssets,
    redirectUrl,
    refetchDestinationBalances,
    refetchSourceBalances,
    refresh,
    reviewBtnDisabled,
    routingInfo,
    setDestinationChain,
    setDestinationToken,
    setSourceChain,
    setSourceToken,
    slippagePercent,
    sourceAssetsData?.assets,
    sourceChain,
    sourceTokenWithBalance,
    sourceTokenWithBalanceStatus,
    usdValueAvailableForPair,
    userPreferredGasLimit,
    userPreferredGasPrice,
    appliedLeapFeeBps,
    isSwapFeeEnabled,
    swapFeeInfo,
    isSanctionedAddressPresent,
    isChainAbstractionView,
    loadingMessages,
  ])

  return value
}
