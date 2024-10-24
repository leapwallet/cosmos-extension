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
  CW20DenomBalanceStore,
  CW20DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
  RootBalanceStore,
  RootDenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import {
  useAllSkipAssets,
  useDebouncedValue,
  useFeeAddresses,
  useFees,
  useMessagesSWR,
  usePriceImpact,
  useRoute,
  useSkipGasFeeSWR,
} from '@leapwallet/elements-hooks'
import { QueryStatus, useQuery as reactUseQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { calculateFeeAmount, useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useChainInfos } from 'hooks/useChainInfos'
import useQuery from 'hooks/useQuery'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { chainInfoStore } from 'stores/chain-infos-store'
import { SourceChain, SourceToken, SwapFeeInfo } from 'types/swap'
import { isCompassWallet } from 'utils/isCompassWallet'

import {
  useAddresses,
  useGetChainsToShow,
  useGetErrorMsg,
  useGetInfoMsg,
  useGetSwapAssets,
} from './index'
import { useEnableToken } from './useEnableToken'
import { useFeeAffiliates } from './useFeeAffiliates'
import { useSwapVenues } from './useSwapVenues'
import { useTokenWithBalances } from './useTokenWithBalances'

const useAllSkipAssetsParams = {
  includeCW20Assets: true,
  includeNoMetadataAssets: false,
  includeEVMAssets: false,
  includeSVMAssets: false,
  nativeOnly: false,
}

export type SwapsTxType = {
  inAmount: string
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  route: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refresh: () => Promise<any>
  handleSwitchOrder: () => void
  isSwitchOrderPossible: boolean
  slippagePercent: number
  setSlippagePercent: React.Dispatch<React.SetStateAction<number>>
  setInAmount: React.Dispatch<React.SetStateAction<string>>
  priceImpactWarning: string | undefined
  priceImpactPercentage: BigNumber | undefined
  priceImpactPercent: BigNumber
  usdPriceImpactPercentage: BigNumber
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
const SEIYAN_TOKEN_DENOM = 'sei1hrndqntlvtmx2kepr0zsfgr7nzjptcc72cr4ppk4yav58vvy7v3s4er8ed'
const SEI_TOKEN_DENOM = 'usei'

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

  const aggregatedSourceTokens = getAggregatedSpendableBalances(SWAP_NETWORK)
  const aggregatedSourceChainTokens = useMemo(() => {
    const chainToShowKeys = chainsToShow.map((chain) => chain.key)
    const allChainsInfo = Object.values(chainInfoStore.chainInfos)?.filter((chainInfo) =>
      chainToShowKeys.includes(chainInfo.key),
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
  }, [aggregatedSourceTokens, chainsToShow])

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

  const { data: skipAssets } = useAllSkipAssets(useAllSkipAssetsParams)
  const { data: sourceAssetsData, isLoading: loadingSourceAssets } = useGetSwapAssets(
    denoms,
    sourceChainTokens,
    isChainAbstractionView ? rootBalanceStore.allAggregatedTokensLoading : sourceTokensLoading,
    sourceChain,
    autoFetchedCW20DenomsStore,
    skipAssets,
    true,
    isChainAbstractionView,
    chainsToShow,
  )

  const { data: destinationAssetsData, isLoading: loadingDestinationAssets } = useGetSwapAssets(
    denoms,
    destinationChainTokens,
    isChainAbstractionView ? rootBalanceStore.allAggregatedTokensLoading : destinationTokensLoading,
    destinationChain,
    autoFetchedCW20DenomsStore,
    skipAssets,
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
  const searchedSourceToken = useQuery().get('sourceToken') ?? undefined
  const searchedDestinationToken = useQuery().get('destinationToken') ?? undefined

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
  )
  const { enableToken: enableDestinationToken } = useEnableToken(
    destinationChain,
    destinationToken,
    autoFetchedCW20DenomsStore,
    betaCW20DenomsStore,
    cw20DenomsStore,
    disabledCW20DenomsStore,
    enabledCW20DenomsStore,
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
      const sourceChainParams = chainsToShow.find((chain) => chain.chainId === searchedSourceChain)

      const destinationChainParams = chainsToShow.find(
        (chain) => chain.chainId === searchedDestinationChain,
      )

      const activeChainToShow = chainsToShow.find(
        (chain) => chain.chainId === activeChainInfo.chainId,
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
        setSourceChain(chainsToShow[0])
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
          setDestinationChain(chainsToShow[1])
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
    const sourceAssets = sourceAssetsData?.assets ?? []

    if (sourceChain && sourceAssets && sourceAssets.length > 0 && !isSwitchedRef.current) {
      if (searchedSourceToken) {
        if (!searchedAssetsSetRef.current.sourceToken) {
          searchedAssetsSetRef.current.sourceToken = true
          const sourceToken = sourceAssets.find(
            (asset) =>
              asset.ibcDenom === searchedSourceToken ||
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
        const baseDenomToSet = sourceChain.baseDenom
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
    const destinationAssets = destinationAssetsData?.assets ?? []

    if (
      destinationChain &&
      destinationAssets &&
      destinationAssets.length > 0 &&
      !isSwitchedRef.current
    ) {
      if (searchedDestinationToken) {
        if (!searchedAssetsSetRef.current.destinationToken) {
          searchedAssetsSetRef.current.destinationToken = true
          const destinationToken = destinationAssets.find(
            (asset) =>
              asset.ibcDenom === searchedDestinationToken ||
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
          const destinationToken = destinationAssets.find(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            (asset) =>
              asset.coinMinimalDenom ===
              (searchedSourceToken?.replace(/(cw20:|erc20\/)/g, '') !== SEIYAN_TOKEN_DENOM
                ? SEIYAN_TOKEN_DENOM
                : SEI_TOKEN_DENOM),
          )
          if (destinationToken) {
            setDestinationToken(destinationToken)
            return
          }
          setDestinationToken(destinationAssets[1])
          return
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const baseDenomToSet = destinationChain.baseDenom
        const destinationToken = destinationAssets.find((asset) =>
          !sourceChain ||
          sourceChain.chainId !== destinationChain.chainId ||
          !sourceToken ||
          sourceToken?.coinMinimalDenom !== baseDenomToSet
            ? getKeyToUseForDenoms(asset.skipAsset.denom, asset.skipAsset.originChainId) ===
              getKeyToUseForDenoms(baseDenomToSet, destinationChain.chainId)
            : asset.coinMinimalDenom !== sourceToken.coinMinimalDenom,
        )

        if (destinationToken) {
          setDestinationToken(destinationToken)
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
    amountOut: amountOutWithFees,
    routeResponse: routeResponseWithFees,
    routeError: routeErrorWithFees,
    isLoadingRoute: loadingRoutesWithFees,
    refresh: refreshRouteWithFees,
  } = useRoute(
    debouncedInAmount,
    sourceToken?.skipAsset,
    sourceChain,
    destinationToken?.skipAsset,
    destinationChain,
    isRouteQueryEnabled && isSwapFeeEnabled,
    undefined,
    swapVenue,
    undefined,
    undefined,
    undefined,
    undefined,
    leapFeeBps,
  )

  const {
    amountOut: amountOutWithoutFees,
    routeResponse: routeResponseWithoutFees,
    routeError: routeErrorWithoutFees,
    isLoadingRoute: loadingRoutesWithoutFees,
    refresh: refreshRouteWithoutFees,
  } = useRoute(
    debouncedInAmount,
    sourceToken?.skipAsset,
    sourceChain,
    destinationToken?.skipAsset,
    destinationChain,
    isRouteQueryEnabled,
    undefined,
    swapVenue,
    undefined,
    undefined,
    undefined,
    undefined,
  )

  const { amountOut, routeResponse, routeError, loadingRoutes, refresh, appliedLeapFeeBps } =
    useMemo(() => {
      const finalResponse = {
        loadingRoutes: isSwapFeeEnabled
          ? loadingRoutesWithoutFees || loadingRoutesWithFees
          : loadingRoutesWithoutFees,
        appliedLeapFeeBps: '0',
        amountOut: amountOutWithoutFees,
        routeResponse: routeResponseWithoutFees,
        routeError: routeErrorWithoutFees,
        refresh: refreshRouteWithoutFees,
      }
      if (!isSwapFeeEnabled) {
        return {
          ...finalResponse,
          loadingRoutes: loadingRoutesWithoutFees,
          amountOut: amountOutWithoutFees,
          routeResponse: routeResponseWithoutFees,
          routeError: routeErrorWithoutFees,
          refresh: refreshRouteWithoutFees,
        }
      }
      if (routeResponseWithFees) {
        if (routeResponseWithFees?.response?.does_swap) {
          const swapChainId = routeResponseWithFees.response.swap_venue?.chain_id
          if (leapFeeAddresses && leapFeeAddresses[swapChainId]) {
            return {
              ...finalResponse,
              amountOut: amountOutWithFees,
              routeResponse: routeResponseWithFees,
              routeError: routeErrorWithFees,
              appliedLeapFeeBps: leapFeeBps,
              refresh: refreshRouteWithFees,
            }
          } else {
            return finalResponse
          }
        } else {
          return finalResponse
        }
      }
      if (!!routeErrorWithFees || !!routeErrorWithoutFees) {
        return {
          ...finalResponse,
          amountOut: '-',
          routeResponse: undefined,
          routeError: routeErrorWithFees || routeErrorWithoutFees,
          refresh: () => {
            return Promise.resolve()
          },
        }
      }
      return {
        ...finalResponse,
        amountOut: '-',
        routeResponse: undefined,
        routeError: undefined,
        refresh: () => {
          return Promise.resolve()
        },
      }
    }, [
      leapFeeAddresses,
      loadingRoutesWithFees,
      amountOutWithFees,
      routeResponseWithFees,
      routeErrorWithFees,
      refreshRouteWithFees,
      amountOutWithoutFees,
      routeResponseWithoutFees,
      routeErrorWithoutFees,
      loadingRoutesWithoutFees,
      refreshRouteWithoutFees,
      leapFeeBps,
      isSwapFeeEnabled,
    ])

  const invalidAmount = useMemo(() => {
    return inAmount !== '' && (isNaN(Number(inAmount)) || Number(inAmount) < 0)
  }, [inAmount])

  const { warning: priceImpactWarning, priceImpactPercentage } = usePriceImpact(routeResponse)

  const priceImpactPercent = useMemo(
    () =>
      routeResponse?.response?.does_swap
        ? new BigNumber(routeResponse?.response?.swap_price_impact_percent ?? NaN)
        : new BigNumber(0),
    [routeResponse?.response?.does_swap, routeResponse?.response?.swap_price_impact_percent],
  )
  const sourceAssetUSDPrice = useMemo(
    () => new BigNumber(routeResponse?.response?.usd_amount_in ?? NaN),
    [routeResponse?.response?.usd_amount_in],
  )
  const destinationAssetUSDPrice = useMemo(
    () => new BigNumber(routeResponse?.response?.usd_amount_out ?? NaN),
    [routeResponse?.response?.usd_amount_out],
  )

  const usdPriceImpactPercentage = useMemo(
    () =>
      new BigNumber(sourceAssetUSDPrice)
        .minus(destinationAssetUSDPrice)
        .dividedBy(sourceAssetUSDPrice)
        .multipliedBy(100),
    [destinationAssetUSDPrice, sourceAssetUSDPrice],
  )

  const usdValueAvailableForPair = useMemo(() => {
    if (!routeResponse?.response) return undefined

    return (
      routeResponse?.response?.usd_amount_in !== undefined &&
      routeResponse?.response?.usd_amount_out !== undefined
    )
  }, [routeResponse?.response])

  const { userAddresses, userAddressesError } = useAddresses(
    routeResponse?.response.chain_ids as string[],
  )

  const { affiliates } = useFeeAffiliates(
    routeResponse,
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

  const { data: messages, isLoading: loadingMessages } = useMessagesSWR(
    userAddresses,
    routeResponse?.response,
    options,
    !!routeResponse?.response,
  )
  const { data: skipGasFee, isLoading: isSkipGasFeeLoading } = useSkipGasFeeSWR(
    messages,
    userAddresses,
    true,
    undefined,
    !!messages,
  )

  const swapFeeInfo = useMemo(() => {
    if (
      !isSwapFeeEnabled ||
      !skipAssets ||
      !messages ||
      !routeResponse?.response ||
      !routeResponse?.response?.does_swap
    ) {
      return undefined
    }

    const messageIndex = 0
    const messageObj = messages[messageIndex]
    let min_asset: any = null
    let amount = 0
    let denom = ''
    let feeAmountValue = null
    if ('multi_chain_msg' in messageObj) {
      const message = messageObj.multi_chain_msg
      const messageJson = JSON.parse(message.msg)
      if (messageJson?.memo) {
        const memo = JSON.parse(messageJson.memo)
        min_asset = memo?.wasm?.msg?.swap_and_action?.min_asset
      } else if (messageJson?.msg) {
        min_asset = messageJson.msg?.swap_and_action?.min_asset
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

    const swapVenueChainId = routeResponse?.response?.swap_venue?.chain_id
    const skipAsset = skipAssets[swapVenueChainId ?? ''].find(
      (asset) => asset.denom.replace(/(cw20:|erc20\/)/g, '') === denom,
    )
    if (skipAsset && amount > 0) {
      const minAssetAmount = new BigNumber(amount).dividedBy(10 ** Number(skipAsset?.decimals ?? 0))
      feeAmountValue = minAssetAmount.multipliedBy(leapFeePercentage)
    }
    return {
      feeAmountValue: feeAmountValue ? feeAmountValue : null,
      feeCharged: Number(appliedLeapFeeBps) * 0.01,
      feeCollectionAddress: leapFeeAddresses && (leapFeeAddresses[swapVenueChainId] ?? ''),
      swapFeeDenomInfo: skipAsset,
    }
  }, [
    skipAssets,
    messages,
    routeResponse?.response,
    isSwapFeeEnabled,
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
    amountExceedsBalance,
    destinationChain,
    destinationToken,
    errorMsg,
    gasError,
    inAmount,
    invalidAmount,
    isSkipGasFeeLoading,
    loadingDestinationAssets,
    loadingRoutes,
    loadingSourceAssets,
    sourceChain,
    sourceToken,
    isSanctionedAddressPresent,
    amountOut,
    loadingMessages,
    skipGasFee,
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

  const route = useMemo(() => {
    return {
      ...(routeResponse ?? {}),
      messages: messages ?? [],
      userAddresses: userAddresses ?? [],
    }
  }, [messages, routeResponse, userAddresses])

  const value = useMemo(() => {
    return {
      inAmount,
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
      route,
      refresh,
      handleSwitchOrder,
      isSwitchOrderPossible,
      slippagePercent,
      setSlippagePercent,
      setInAmount,
      priceImpactWarning,
      priceImpactPercentage: priceImpactPercentage as BigNumber | undefined,
      priceImpactPercent,
      usdPriceImpactPercentage,
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
    infoMsg,
    invalidAmount,
    isMoreThanOneStepTransaction,
    isSkipGasFeeLoading,
    isSwitchOrderPossible,
    loadingDestinationAssets,
    loadingMsg,
    loadingRoutes,
    loadingSourceAssets,
    priceImpactPercent,
    priceImpactPercentage,
    priceImpactWarning,
    redirectUrl,
    refetchDestinationBalances,
    refetchSourceBalances,
    refresh,
    reviewBtnDisabled,
    route,
    setDestinationChain,
    setDestinationToken,
    setSourceChain,
    setSourceToken,
    slippagePercent,
    sourceAssetsData?.assets,
    sourceChain,
    sourceTokenWithBalance,
    sourceTokenWithBalanceStatus,
    usdPriceImpactPercentage,
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
