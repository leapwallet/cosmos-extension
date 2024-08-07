import {
  currencyDetail,
  fetchCurrency,
  GasOptions,
  useChainInfo,
  useformatCurrency,
  useGasAdjustmentForChain,
  useNativeFeeDenom,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  ChainInfos,
  DefaultGasEstimates,
  GasPrice,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import {
  SwapVenue,
  useDebouncedValue,
  useMessages,
  usePriceImpact,
  useRoute,
  useSkipGasFeeSWR,
} from '@leapwallet/elements-hooks'
import { QueryStatus, useQuery as reactUseQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { calculateFeeAmount, useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useQuery from 'hooks/useQuery'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SourceChain, SourceToken } from 'types/swap'
import { AggregatedSupportedChain } from 'types/utility'
import { isCompassWallet } from 'utils/isCompassWallet'

import {
  useAddresses,
  useGetChainsToShow,
  useGetErrorMsg,
  useGetInfoMsg,
  useGetSwapAssets,
} from './index'
import { useEnableToken } from './useEnableToken'
import { useTokenWithBalances } from './useTokenWithBalances'

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
  errorMsg: string
  loadingMsg: string
  reviewBtnDisabled: boolean
  setSourceToken: React.Dispatch<React.SetStateAction<SourceToken | null>>
  setDestinationToken: React.Dispatch<React.SetStateAction<SourceToken | null>>
  setSourceChain: React.Dispatch<React.SetStateAction<SourceChain | undefined>>
  setDestinationChain: React.Dispatch<React.SetStateAction<SourceChain | undefined>>
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
}

const SEI_ASTROPORT_SWAP_VENUE: SwapVenue = { chain_id: 'pacific-1', name: 'sei-astroport' }
export const SWAP_NETWORK = 'mainnet'

export function useSwapsTx(): SwapsTxType {
  const activeChain = useActiveChain()
  const activeChainInfo = useChainInfo(
    (activeChain as AggregatedSupportedChain) === AGGREGATED_CHAIN_KEY ? 'cosmos' : activeChain,
  )
  const [preferredCurrency] = useUserPreferredCurrency()
  const [formatCurrency] = useformatCurrency()
  const isSwitchedRef = useRef(false)

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
  const debouncedInAmount = useDebouncedValue(inAmount, 500)
  const { chainsToShow, chainsToShowLoading } = useGetChainsToShow()
  const { data: sourceAssetsData, isLoading: loadingSourceAssets } = useGetSwapAssets(sourceChain)
  const { data: destinationAssetsData, isLoading: loadingDestinationAssets } =
    useGetSwapAssets(destinationChain)

  const refetchSourceBalances = useCallback(() => {
    sourceAssetsData?.refetchBalances?.()
  }, [sourceAssetsData])

  const refetchDestinationBalances = useCallback(() => {
    destinationAssetsData?.refetchBalances?.()
  }, [destinationAssetsData])

  /**
   * states for fee
   */
  const [gasError, setGasError] = useState<string | null>(null)
  const [gasOption, setGasOption] = useState<GasOptions>(GasOptions.LOW)
  const [gasEstimate, setGasEstimate] = useState(DefaultGasEstimates.DEFAULT_GAS_TRANSFER)
  const [userPreferredGasPrice, setUserPreferredGasPrice] = useState<GasPrice | undefined>(
    undefined,
  )
  const [userPreferredGasLimit, setUserPreferredGasLimit] = useState<number | undefined>(undefined)
  const defaultGasPrice = useDefaultGasPrice({
    activeChain: sourceChain?.key ?? 'cosmos',
  })

  const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
    option: gasOption,
    gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
  })

  const nativeFeeDenom = useNativeFeeDenom(sourceChain?.key ?? 'cosmos', SWAP_NETWORK)
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

  /**
   * Function to enable a disabled token
   */
  const { enableToken: enableSourceToken } = useEnableToken(sourceChain, sourceToken)
  const { enableToken: enableDestinationToken } = useEnableToken(destinationChain, destinationToken)

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
        /**
         * If active chain is Osmosis, set Cosmos as the starting destination chain
         */
        if (activeChainInfo.chainId === ChainInfos.osmosis.chainId) {
          if (chain.chainId === ChainInfos.cosmos.chainId) {
            return true
          }

          return false
        }

        /**
         * Else, set Osmosis as the starting destination chain
         */
        return chain.chainId === ChainInfos.osmosis.chainId
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

    if (sourceAssets && sourceAssets.length > 0 && !isSwitchedRef.current) {
      if (searchedSourceToken) {
        if (!searchedAssetsSetRef.current.sourceToken) {
          searchedAssetsSetRef.current.sourceToken = true
          const sourceToken = sourceAssets.find(
            (asset) =>
              asset.ibcDenom === searchedSourceToken ||
              asset.coinMinimalDenom === searchedSourceToken,
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
        if (sourceChain) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const baseDenomToSet = sourceChain.baseDenom
          const sourceToken = sourceAssets.find((asset) =>
            !destinationChain ||
            destinationChain.chainId !== sourceChain.chainId ||
            !destinationToken ||
            destinationToken.coinMinimalDenom !== baseDenomToSet
              ? asset.coinMinimalDenom === baseDenomToSet
              : asset.coinMinimalDenom !== destinationToken.coinMinimalDenom,
          )

          if (sourceToken) {
            setSourceToken(sourceToken)
            return
          }
        }

        setSourceToken(sourceAssets[0])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceChain, sourceAssetsData?.assets, sourceAssetsData?.assets?.length, searchedSourceToken])

  /**
   * set destination token
   */
  useEffect(() => {
    const destinationAssets = destinationAssetsData?.assets ?? []

    if (destinationAssets && destinationAssets.length > 0 && !isSwitchedRef.current) {
      if (searchedDestinationToken) {
        if (!searchedAssetsSetRef.current.destinationToken) {
          searchedAssetsSetRef.current.destinationToken = true
          const destinationToken = destinationAssets.find(
            (asset) =>
              asset.ibcDenom === searchedDestinationToken ||
              asset.coinMinimalDenom === searchedDestinationToken,
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
              'sei1hrndqntlvtmx2kepr0zsfgr7nzjptcc72cr4ppk4yav58vvy7v3s4er8ed',
          )
          if (destinationToken) {
            setDestinationToken(destinationToken)
            return
          }
          setDestinationToken(destinationAssets[1])
          return
        }

        if (destinationChain) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const baseDenomToSet = destinationChain.baseDenom
          const destinationToken = destinationAssets.find((asset) =>
            !sourceChain ||
            sourceChain.chainId !== destinationChain.chainId ||
            !sourceToken ||
            sourceToken?.coinMinimalDenom !== baseDenomToSet
              ? asset.coinMinimalDenom === baseDenomToSet
              : asset.coinMinimalDenom !== sourceToken.coinMinimalDenom,
          )

          if (destinationToken) {
            setDestinationToken(destinationToken)
            return
          }
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
    useTokenWithBalances(sourceToken, sourceChain)

  const { data: destinationTokenWithBalance, status: destinationTokenWithBalanceStatus } =
    useTokenWithBalances(destinationToken, destinationChain)

  /**
   * element hooks
   */
  const {
    amountOut,
    routeResponse,
    routeError,
    isLoadingRoute: loadingRoutes,
    refresh,
  } = useRoute(
    debouncedInAmount,
    sourceToken?.skipAsset,
    sourceChain,
    destinationToken?.skipAsset,
    destinationChain,
    isRouteQueryEnabled,
    undefined,
    isCompassWallet() ? SEI_ASTROPORT_SWAP_VENUE : undefined,
  )

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

  const options = useMemo(() => {
    return {
      slippageTolerancePercent: String(slippagePercent),
    }
  }, [slippagePercent])

  const { messages } = useMessages(userAddresses, routeResponse?.response, options)
  const { data: skipGasFee, isLoading: isSkipGasFeeLoading } = useSkipGasFeeSWR(
    messages,
    userAddresses,
    true,
  )

  /**
   * set gas estimate
   */
  useEffect(() => {
    if (skipGasFee && skipGasFee.gasFeesAmount) {
      setGasEstimate(
        Number(skipGasFee.gasFeesAmount?.[0]?.gas) ?? DefaultGasEstimates.DEFAULT_GAS_TRANSFER,
      )
    }
  }, [skipGasFee])

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
  const loadingMsg = loadingRoutes && inAmount && sourceToken ? 'Finding transaction routes' : ''
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
  const reviewBtnDisabled =
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
    isSkipGasFeeLoading

  const isSwitchOrderPossible = useMemo(() => {
    return !!destinationToken
  }, [destinationToken])

  const handleSwitchOrder = () => {
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
  }

  const handleInAmountChange = (value: string) => {
    setInAmount(value)
  }

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
    destinationTokenBalancesStatus: destinationTokenWithBalanceStatus,
    errorMsg,
    loadingMsg,
    reviewBtnDisabled,
    setSourceToken,
    setDestinationToken,
    setSourceChain: (value) => {
      sourceTokenNotYetSelectedRef.current = true
      setSourceChain(value)
    },
    setDestinationChain: (value) => {
      destinationTokenNotYetSelectedRef.current = true
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
    route: {
      ...(routeResponse ?? {}),
      messages: messages ?? [],
      userAddresses: userAddresses ?? [],
    },
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
  }
}
