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
  useMessages,
  usePriceImpact,
  useRoute,
  useSkipGasFeeSWR,
} from '@leapwallet/elements-hooks'
import { QueryStatus, useQuery as reactUseQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { calculateFeeAmount } from 'components/gas-price-options'
import useQuery from 'hooks/useQuery'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SourceChain, SourceToken } from 'types/swap'
import { isCompassWallet } from 'utils/isCompassWallet'

import {
  useAddresses,
  useGetChainsToShow,
  useGetDestinationAssets,
  useGetErrorMsg,
  useGetInfoMsg,
  useGetSourceAssets,
} from './index'
import { useEnableToken } from './useEnableToken'
import { useTokenWithBalances } from './useTokenWithBalances'

export type SwapsTxType = {
  inAmount: string
  sourceToken: SourceToken | null
  sourceChain: SourceChain | undefined
  handleInAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  sourceTokenBalanceStatus: QueryStatus
  sourceAssets: SourceToken[]
  chainsToShow: SourceChain[]
  amountExceedsBalance: boolean
  amountOut: string
  destinationToken: SourceToken | null
  destinationTokenBalancesStatus: QueryStatus
  destinationChain: SourceChain | undefined
  destinationAssets: SourceToken[]
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
    fiatValue: string
  }
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
  refetchSourceBalances: (() => void) | undefined
  refetchDestinationBalances: (() => void) | undefined
}

const SEI_ASTROPORT_SWAP_VENUE: SwapVenue = { chain_id: 'pacific-1', name: 'sei-astroport' }

export function useSwapsTx(): SwapsTxType {
  const activeChainInfo = useChainInfo()
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

  const [refetchSourceBalances, setRefetchSourceBalances] = useState<() => void>()
  const [refetchDestinationBalances, setRefetchDestinationBalances] = useState<() => void>()

  /**
   * custom hooks
   */
  const chainsToShow = useGetChainsToShow()
  const { data: sourceAssetsData, isLoading: loadingSourceAssets } = useGetSourceAssets(sourceChain)
  const { data: destinationAssetsData, isLoading: loadingDestinationAssets } =
    useGetDestinationAssets(destinationChain)

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

  const nativeFeeDenom = useNativeFeeDenom(sourceChain?.key)
  const [feeDenom, setFeeDenom] = useState<NativeDenom & { ibcDenom?: string }>(nativeFeeDenom)
  const gasAdjustment = useGasAdjustmentForChain(sourceChain?.key ?? '')

  const sourceChainId = useQuery().get('sourceChainId') ?? undefined
  const destinationChainId = useQuery().get('destinationChainId') ?? undefined
  const sourceTokenValue = useQuery().get('sourceToken') ?? undefined
  const destinationTokenValue = useQuery().get('destinationToken') ?? undefined

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
   * set refetch balances
   */
  useEffect(() => {
    sourceAssetsData?.refetchBalances &&
      setRefetchSourceBalances(sourceAssetsData?.refetchBalances as () => void)

    destinationAssetsData?.refetchBalances &&
      setRefetchDestinationBalances(destinationAssetsData?.refetchBalances as () => void)
  }, [destinationAssetsData?.refetchBalances, sourceAssetsData?.refetchBalances])

  /**
   * set source chain and destination chain
   */
  useEffect(() => {
    if (chainsToShow.length > 0 && (!sourceChain || !destinationChain)) {
      const sourceChainParams = chainsToShow.find((chain) => chain.chainId === sourceChainId)
      const destinationChainParams = chainsToShow.find(
        (chain) => chain.chainId === destinationChainId,
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

      if (sourceChainParams) {
        setSourceChain(sourceChainParams)
      } else if (activeChainToShow) {
        setSourceChain(activeChainToShow)
      } else {
        setSourceChain(chainsToShow[0])
      }

      if (destinationChainParams) {
        setDestinationChain(destinationChainParams)
      } else if (firstNotActiveChainToShow) {
        setDestinationChain(firstNotActiveChainToShow)
      } else {
        if (isCompassWallet()) {
          setDestinationChain(chainsToShow[0])
        } else {
          setDestinationChain(chainsToShow[1])
        }
      }
    }
  }, [
    activeChainInfo.chainId,
    chainsToShow,
    destinationChain,
    sourceChain,
    sourceChainId,
    destinationChainId,
  ])

  /**
   * set source token
   */
  useEffect(() => {
    const sourceAssets = sourceAssetsData?.assets ?? []

    if (sourceAssets && sourceAssets.length > 0 && !isSwitchedRef.current) {
      if (sourceChain) {
        const sourceToken = sourceAssets.find(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (asset) => asset.coinMinimalDenom === sourceChain.baseDenom,
        )

        const sourceTokenParams = sourceAssets.find(
          (asset) =>
            asset.ibcDenom === sourceTokenValue || asset.coinMinimalDenom === sourceTokenValue,
        )

        if (sourceTokenParams) {
          setSourceToken(sourceTokenParams)
          return
        } else if (sourceToken) {
          setSourceToken(sourceToken)
          return
        }
      }

      setSourceToken(sourceAssets[0])
    }
  }, [sourceChain, sourceAssetsData?.assets, sourceAssetsData?.assets?.length, sourceTokenValue])

  /**
   * set destination token
   */
  useEffect(() => {
    const destinationAssets = destinationAssetsData?.assets ?? []

    if (destinationAssets && destinationAssets.length > 0 && !isSwitchedRef.current) {
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

      const destinationTokenParams = destinationAssets.find(
        (asset) =>
          asset.ibcDenom === destinationTokenValue ||
          asset.coinMinimalDenom === destinationTokenValue,
      )

      if (destinationTokenParams) {
        setDestinationToken(destinationTokenParams)
        return
      } else if (destinationChain) {
        const destinationToken = destinationAssets.find(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (asset) => asset.coinMinimalDenom === destinationChain.baseDenom,
        )

        if (destinationToken) {
          setDestinationToken(destinationToken)
          return
        }
      }

      setDestinationToken(destinationAssets[0])
    }
  }, [
    destinationChain,
    destinationAssetsData?.assets,
    destinationAssetsData?.assets?.length,
    destinationTokenValue,
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
    inAmount,
    sourceToken?.skipAsset,
    sourceChain,
    destinationToken?.skipAsset,
    destinationChain,
    true,
    undefined,
    isCompassWallet() ? SEI_ASTROPORT_SWAP_VENUE : undefined,
  )

  const { warning: priceImpactWarning, priceImpactPercentage } = usePriceImpact(routeResponse)
  const { userAddresses, userAddressesError } = useAddresses(
    routeResponse?.response.chain_ids as string[],
  )

  const options = useMemo(() => {
    return {
      slippageTolerancePercent: String(slippagePercent),
    }
  }, [slippagePercent])

  const { messages } = useMessages(userAddresses, routeResponse?.response, options)
  const { data: skipGasFee } = useSkipGasFeeSWR(messages, userAddresses, true)

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

    const baseURL = 'https://cosmos.leapwallet.io/transact/swap'
    return `${baseURL}?sourceChainId=${sourceChain.chainId}&destinationChainId=${destinationChain.chainId}&sourceAssetDenom=${sourceToken?.coinMinimalDenom}&destinationAssetDenom=${destinationToken?.coinMinimalDenom}`
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
    sourceToken === null ||
    destinationToken === null ||
    !sourceChain ||
    !destinationChain ||
    inAmount === ''

  const isSwitchOrderPossible = useMemo(() => {
    return destinationToken ? !!Number(destinationToken.amount) : false
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

  const handleInAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInAmount(event.target.value)
  }

  return {
    inAmount,
    sourceToken: sourceTokenWithBalance,
    sourceTokenBalanceStatus: sourceTokenWithBalanceStatus,
    sourceChain,
    handleInAmountChange,
    sourceAssets: sourceAssetsData?.assets ?? [],
    chainsToShow,
    amountExceedsBalance,
    amountOut,
    destinationToken: destinationTokenWithBalance,
    destinationChain,
    destinationAssets: destinationAssetsData?.assets ?? [],
    destinationTokenBalancesStatus: destinationTokenWithBalanceStatus,
    errorMsg,
    loadingMsg,
    reviewBtnDisabled,
    setSourceToken,
    setDestinationToken,
    setSourceChain,
    setDestinationChain,
    infoMsg,
    redirectUrl,
    isMoreThanOneStepTransaction,
    gasError,
    setGasError,
    feeDenom,
    userPreferredGasLimit,
    userPreferredGasPrice,
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
    refetchSourceBalances,
    refetchDestinationBalances,
  }
}
