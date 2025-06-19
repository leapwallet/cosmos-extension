/* eslint-disable @typescript-eslint/no-explicit-any */

import { APTOS_COIN, APTOS_FA } from '@aptos-labs/ts-sdk'
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
  aptosChainNativeFATokenMapping,
  aptosChainNativeTokenMapping,
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
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useNonNativeCustomChains } from 'hooks'
import { useChainInfos } from 'hooks/useChainInfos'
import useQuery from 'hooks/useQuery'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { chainInfoStore } from 'stores/chain-infos-store'
import { SourceChain, SourceToken, SwapFeeInfo } from 'types/swap'

import { findMinAsset, hasCoinType } from '../utils'
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
import { MosaicRouteQueryResponse } from './useMosaicRoute'
import { SkipRouteResponse, useAggregatedRoute } from './useRoute'
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

export type RoutingInfo =
  | {
      aggregator: RouteAggregator.SKIP
      route: SkipRouteResponse | undefined
      messages: SkipMsgWithCustomTxHash[] | undefined
      userAddresses: string[] | null
    }
  | {
      aggregator: RouteAggregator.MOSAIC
      route: MosaicRouteQueryResponse | undefined
      messages: { customTxHash: string; customMessageChainId: string }[] | undefined
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
  const [sourceTokenSelectPending, setSourceTokenSelectPending] = useState<boolean>(true)
  const [destinationTokenSelectPending, setDestinationTokenSelectPending] = useState<boolean>(true)
  const [slippagePercent, setSlippagePercent] = useState(0.5)

  const searchedAssetsSetRef = useRef({
    sourceChain: false,
    destinationChain: false,
    sourceToken: false,
    destinationToken: false,
  })
  const sourceTokenNotYetSelectedRef = useRef<boolean>(false)
  const destinationTokenNotYetSelectedRef = useRef<boolean>(false)

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
    ? getLoadingStatusForChain(sourceChain?.key, SWAP_NETWORK)
    : false

  const destinationTokensLoading = destinationChain
    ? getLoadingStatusForChain(destinationChain?.key, SWAP_NETWORK)
    : false

  const combinedDenoms = denoms

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
  const { data: _sourceAssetsData, isLoading: loadingSourceAssets } = useGetSwapAssets(
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

  const { data: _destinationAssetsData, isLoading: loadingDestinationAssets } = useGetSwapAssets(
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

  const sourceAssetsData = useMemo(() => {
    if (!destinationToken) return _sourceAssetsData?.assets
    return _sourceAssetsData?.assets?.filter((asset) => {
      if (
        asset?.skipAsset?.denom === destinationToken?.skipAsset?.denom &&
        asset?.skipAsset?.chainId === destinationToken?.skipAsset?.chainId
      ) {
        return false
      }
      return true
    })
  }, [_sourceAssetsData?.assets, destinationToken])

  const destinationAssetsData = useMemo(() => {
    if (!sourceToken) return _destinationAssetsData?.assets
    return _destinationAssetsData?.assets?.filter((asset) => {
      if (
        asset?.skipAsset?.denom === sourceToken?.skipAsset?.denom &&
        asset?.skipAsset?.chainId === sourceToken?.skipAsset?.chainId
      ) {
        return false
      }
      return true
    })
  }, [_destinationAssetsData?.assets, sourceToken])

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
  const searchedSourceToken = useMemo(() => {
    if (!_searchedSourceToken) return undefined

    if (_searchedSourceToken === 'wei') return 'ethereum-native'

    if (Object.values(aptosChainNativeTokenMapping).includes(_searchedSourceToken)) {
      return APTOS_COIN
    }

    if (Object.values(aptosChainNativeFATokenMapping).includes(_searchedSourceToken)) {
      return APTOS_FA
    }

    return _searchedSourceToken
  }, [_searchedSourceToken])

  const searchedDestinationToken = useMemo(() => {
    if (!_searchedDestinationToken) return undefined

    if (_searchedDestinationToken === 'wei') return 'ethereum-native'

    if (Object.values(aptosChainNativeTokenMapping).includes(_searchedDestinationToken)) {
      return APTOS_COIN
    }

    if (Object.values(aptosChainNativeFATokenMapping).includes(_searchedDestinationToken)) {
      return APTOS_FA
    }

    return _searchedDestinationToken
  }, [_searchedDestinationToken])

  const isRouteQueryEnabled = useMemo(() => {
    if (
      !sourceChain ||
      !destinationChain ||
      !sourceToken ||
      !destinationToken ||
      rootBalanceStore.allAggregatedTokensLoading
    ) {
      return false
    }
    if (
      sourceChain.chainId === destinationChain.chainId &&
      sourceToken?.skipAsset?.denom === destinationToken?.skipAsset?.denom
    ) {
      return false
    }
    if (!debouncedInAmount || Number(debouncedInAmount) <= 0) return false
    return true
  }, [
    debouncedInAmount,
    destinationChain,
    destinationToken,
    rootBalanceStore.allAggregatedTokensLoading,
    sourceChain,
    sourceToken,
  ])

  const isSwapFeeEnabled = useMemo(() => {
    if (!featureFlags) return false
    return featureFlags.swaps.fees === 'active'
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
    rootDenomsStore,
  )

  const callbackPostTx = useCallback(() => {
    enableDestinationToken()
    enableSourceToken()
  }, [enableDestinationToken, enableSourceToken])

  /**
   * set source & destination tokens
   */
  useEffect(() => {
    const customChainKeys = new Set(Object.values(customChains).map((chain) => chain.key))
    const destinationAssets = (destinationAssetsData ?? []).filter(
      (chain) => !chain.tokenBalanceOnChain || !customChainKeys.has(chain.tokenBalanceOnChain),
    )
    const sourceAssets = (sourceAssetsData ?? []).filter(
      (chain) => chain.tokenBalanceOnChain && !customChainKeys.has(chain.tokenBalanceOnChain),
    )

    if (
      !chainsToShow ||
      chainsToShow.length === 0 ||
      !sourceAssets ||
      sourceAssets.length === 0 ||
      !destinationAssets ||
      destinationAssets.length === 0 ||
      isSwitchedRef.current ||
      searchedAssetsSetRef.current.sourceToken ||
      searchedAssetsSetRef.current.destinationToken
    ) {
      return
    }

    const highestBalanceToken = sourceAssets?.[0]
    const secondHighestBalanceToken = sourceAssets?.[1] ?? sourceAssets?.[0]
    const isZeroState =
      !highestBalanceToken?.amount || new BigNumber(highestBalanceToken.amount).isEqualTo(0)

    const atomTokenToPreselect = {
      denom: 'uatom',
      chainId: 'cosmoshub-4',
    }
    const osmoTokenToPreselect = {
      denom: 'uosmo',
      chainId: 'osmosis-1',
    }

    const atomToken = sourceAssets.find(
      (asset) =>
        asset?.skipAsset?.denom === atomTokenToPreselect?.denom &&
        asset?.skipAsset?.chainId === atomTokenToPreselect?.chainId,
    )
    const osmoToken = sourceAssets.find(
      (asset) =>
        asset?.skipAsset?.denom === osmoTokenToPreselect?.denom &&
        asset?.skipAsset?.chainId === osmoTokenToPreselect?.chainId,
    )

    let firstToken = highestBalanceToken
    let secondToken = secondHighestBalanceToken

    if (isZeroState) {
      firstToken = atomToken ?? highestBalanceToken
      secondToken = osmoToken ?? secondHighestBalanceToken
    }

    let sourceTokenToSet: SourceToken | undefined
    let destinationTokenToSet: SourceToken | undefined
    if (searchedSourceChain && searchedSourceToken) {
      sourceTokenToSet = sourceAssets.find(
        (asset) =>
          (asset.ibcDenom === searchedSourceToken ||
            (asset.skipAsset.evmTokenContract &&
              asset.skipAsset.evmTokenContract?.replace(/(cw20:|erc20\/)/g, '') ===
                searchedSourceToken?.replace(/(cw20:|erc20\/)/g, '')) ||
            (hasCoinType(asset.skipAsset) &&
              asset.skipAsset.coinType?.toLowerCase() === searchedSourceToken?.toLowerCase()) ||
            getKeyToUseForDenoms(asset.skipAsset.denom, asset.skipAsset.originChainId) ===
              searchedSourceToken?.replace(/(cw20:|erc20\/)/g, '') ||
            asset.skipAsset.denom === searchedSourceToken ||
            getKeyToUseForDenoms(asset.skipAsset.originDenom, asset.skipAsset.originChainId) ===
              searchedSourceToken?.replace(/(cw20:|erc20\/)/g, '') ||
            asset.skipAsset.originDenom === searchedSourceToken) &&
          asset?.skipAsset?.chainId === searchedSourceChain,
      )
    }
    if (searchedDestinationChain && searchedDestinationToken) {
      destinationTokenToSet = destinationAssets.find(
        (asset) =>
          (asset.ibcDenom === searchedDestinationToken ||
            (asset.skipAsset.evmTokenContract &&
              asset.skipAsset.evmTokenContract?.replace(/(cw20:|erc20\/)/g, '') ===
                searchedDestinationToken?.replace(/(cw20:|erc20\/)/g, '')) ||
            (hasCoinType(asset.skipAsset) &&
              asset.skipAsset.coinType?.toLowerCase() ===
                searchedDestinationToken?.toLowerCase()) ||
            getKeyToUseForDenoms(asset.skipAsset.denom, asset.skipAsset.originChainId) ===
              searchedDestinationToken?.replace(/(cw20:|erc20\/)/g, '') ||
            asset.skipAsset.denom === searchedDestinationToken ||
            getKeyToUseForDenoms(asset.skipAsset.originDenom, asset.skipAsset.originChainId) ===
              searchedDestinationToken?.replace(/(cw20:|erc20\/)/g, '') ||
            asset.skipAsset.originDenom === searchedDestinationToken) &&
          asset?.skipAsset?.chainId === searchedDestinationChain,
      )
    }

    if (sourceTokenToSet) {
      if (!destinationTokenToSet) {
        destinationTokenToSet = [secondToken, firstToken].find(
          (token) =>
            token?.skipAsset?.chainId !== sourceTokenToSet?.skipAsset?.chainId ||
            token?.skipAsset?.denom !== sourceTokenToSet?.skipAsset?.denom,
        )
      }
    } else {
      if (destinationTokenToSet) {
        sourceTokenToSet = [firstToken, secondToken].find(
          (token) =>
            token?.skipAsset?.chainId !== destinationTokenToSet?.skipAsset?.chainId ||
            token?.skipAsset?.denom !== destinationTokenToSet?.skipAsset?.denom,
        )
      } else {
        sourceTokenToSet = firstToken
        destinationTokenToSet = secondToken
      }
    }

    const sourceTokenChain = chainsToShow.find(
      (chain) => chain.chainId === sourceTokenToSet?.skipAsset?.chainId,
    )
    const destinationTokenChain = chainsToShow.find(
      (chain) => chain.chainId === destinationTokenToSet?.skipAsset?.chainId,
    )

    if (sourceTokenToSet && sourceTokenChain) {
      setSourceToken(sourceTokenToSet)
      setSourceTokenSelectPending(false)
      setSourceChain(sourceTokenChain)
    }
    if (destinationTokenToSet && destinationTokenChain) {
      setDestinationToken(destinationTokenToSet)
      setDestinationTokenSelectPending(false)
      setDestinationChain(destinationTokenChain)
    }
    searchedAssetsSetRef.current.sourceToken = true
    searchedAssetsSetRef.current.destinationToken = true
    return
  }, [
    destinationChain,
    destinationAssetsData,
    destinationAssetsData?.length,
    sourceAssetsData?.length,
    searchedDestinationToken,
    searchedSourceChain,
    searchedDestinationChain,
    searchedSourceToken,
    customChains,
    sourceAssetsData,
    chainsToShow,
  ])

  //TODO: Add better handling for this case: If movement chain is selected set the default token to a move token
  useEffect(() => {
    //   if (sourceChain) {
    //     if (prevSourceChain.current === 'movement' && sourceChain.key !== 'movement') {
    //       setDestinationToken(null)
    //       setDestinationChain(undefined)
    //     }
    //     prevSourceChain.current = sourceChain.key
    //   }
    //
    if (
      sourceChain?.key === 'movement' &&
      destinationAssetsData &&
      sourceToken?.chain === 'movement' &&
      (destinationToken?.chain !== 'movement' ||
        (sourceToken?.skipAsset?.denom &&
          destinationToken?.skipAsset?.denom === sourceToken?.skipAsset?.denom))
    ) {
      // If selected source token is movement token and destionation token is not a movement token
      // set the destination token to first movement token
      const destToken = destinationAssetsData?.find(
        (asset) =>
          asset.chain === 'movement' && asset.coinMinimalDenom !== sourceToken.coinMinimalDenom,
      )
      if (!destToken) return
      setDestinationChain(sourceChain)
      setDestinationToken(destToken)
    } else if (
      sourceToken &&
      sourceChain &&
      sourceChain.key !== 'movement' &&
      sourceToken.chain !== 'movement' &&
      destinationAssetsData &&
      destinationToken?.chain === 'movement'
    ) {
      // If selected source token is not movement token and destination token is movement token
      // set the destination token to the first non-movement token
      const destToken = destinationAssetsData?.find(
        (asset) =>
          asset.chain !== 'movement' &&
          (asset.skipAsset.denom !== sourceToken.skipAsset.denom ||
            asset.skipAsset.chainId !== sourceToken.skipAsset.chainId),
      )
      if (!destToken) return
      const destChain = chainsToShow?.find((chain) => chain.key === destToken.chain)
      if (!destChain) return
      setDestinationChain(destChain)
      setDestinationToken(destToken)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceChain, destinationAssetsData, sourceToken, destinationToken])

  const { data: sourceTokenWithBalance, status: sourceTokenWithBalanceStatus } =
    useTokenWithBalances(
      sourceToken,
      sourceChain,
      sourceAssetsData,
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
      destinationAssetsData,
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
    isRouteQueryEnabled && !!routeResponse?.response,
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
    if (
      !isSwapFeeEnabled ||
      !messages ||
      !routeResponse?.response ||
      routeResponse.aggregator === RouteAggregator.MOSAIC
    ) {
      return undefined
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

    const baseURL = 'https://swapfast.app'
    return `${baseURL}/?sourceChainId=${sourceChain.chainId}&destinationChainId=${destinationChain.chainId}&sourceAsset=${sourceToken?.coinMinimalDenom}&destinationAsset=${destinationToken?.coinMinimalDenom}`
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
    const isMosaicRoute = routeResponse?.aggregator === RouteAggregator.MOSAIC
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
      (!isMosaicRoute && loadingMessages)
    )
  }, [
    routeResponse?.aggregator,
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
    if (routeResponse?.aggregator === RouteAggregator.MOSAIC) {
      return {
        aggregator: RouteAggregator.MOSAIC,
        route: routeResponse as MosaicRouteQueryResponse,
        messages: undefined,
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
      sourceAssets: sourceAssetsData ?? [],
      loadingSourceAssets: loadingSourceAssets || sourceTokenSelectPending,
      chainsToShow,
      loadingChains: chainsToShowLoading,
      amountExceedsBalance,
      invalidAmount,
      amountOut,
      destinationToken: destinationTokenWithBalance,
      destinationChain,
      loadingDestinationAssets: loadingDestinationAssets || destinationTokenSelectPending,
      destinationAssets: destinationAssetsData ?? [],
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
    destinationAssetsData,
    destinationChain,
    destinationTokenWithBalance,
    destinationTokenWithBalanceStatus,
    sourceTokenSelectPending,
    destinationTokenSelectPending,
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
    sourceAssetsData,
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
