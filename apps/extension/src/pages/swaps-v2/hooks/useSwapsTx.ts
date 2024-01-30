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
import { useMessages, useRoute, useSKIPGasFeeSWR } from '@leapwallet/elements-hooks'
import { useQuery } from '@tanstack/react-query'
import { calculateFeeAmount } from 'components/gas-price-options'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

import {
  useAddresses,
  useGetChainsToShow,
  useGetDestinationAssets,
  useGetErrorMsg,
  useGetInfoMsg,
  useGetSourceAssets,
} from './index'

export type SwapsTxType = {
  inAmount: string
  sourceToken: SourceToken | null
  sourceChain: SourceChain | undefined
  handleInAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  sourceAssets: SourceToken[]
  chainsToShow: SourceChain[]
  amountExceedsBalance: boolean
  amountOut: string
  destinationToken: SourceToken | null
  destinationChain: SourceChain | undefined
  destinationAssets: SourceToken[]
  errorMsg: string
  loadingMsg: string
  reviewBtnDisabled: boolean
  setSourceToken: React.Dispatch<React.SetStateAction<SourceToken | null>>
  setDestinationToken: React.Dispatch<React.SetStateAction<SourceToken | null>>
  setSourceChain: React.Dispatch<React.SetStateAction<SourceChain | undefined>>
  setDestinationChain: React.Dispatch<React.SetStateAction<SourceChain | undefined>>
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
  impactedPriceValue: string
  setImpactedPriceValue: React.Dispatch<React.SetStateAction<string>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refresh: () => Promise<any>
  handleSwitchOrder: () => void
  isSwitchOrderPossible: boolean
  slippagePercent: number
  setSlippagePercent: React.Dispatch<React.SetStateAction<number>>
  setInAmount: React.Dispatch<React.SetStateAction<string>>
}

export function useSwapsTx(): SwapsTxType {
  const activeChainInfo = useChainInfo()
  const [preferredCurrency] = useUserPreferredCurrency()
  const [formatCurrency] = useformatCurrency()
  const [impactedPriceValue, setImpactedPriceValue] = useState('')
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

  /**
   * custom hooks
   */
  const chainsToShow = useGetChainsToShow()
  const { data: sourceAssets = [], isLoading: loadingSourceAssets } =
    useGetSourceAssets(sourceChain)
  const { data: destinationAssets = [], isLoading: loadingDestinationAssets } =
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

  /**
   * set source chain and destination chain
   */
  useEffect(() => {
    if (chainsToShow.length > 0 && (!sourceChain || !destinationChain)) {
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

      if (activeChainToShow) {
        setSourceChain(activeChainToShow)
      } else {
        setSourceChain(chainsToShow[0])
      }

      if (firstNotActiveChainToShow) {
        setDestinationChain(firstNotActiveChainToShow)
      } else {
        setDestinationChain(chainsToShow[1])
      }
    }
  }, [activeChainInfo.chainId, chainsToShow, destinationChain, sourceChain])

  /**
   * set source token
   */
  useEffect(() => {
    if (sourceAssets && sourceAssets.length > 0 && !isSwitchedRef.current) {
      if (sourceChain) {
        const sourceToken = sourceAssets.find(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (asset) => asset.coinMinimalDenom === sourceChain.baseDenom,
        )

        if (sourceToken) {
          setSourceToken(sourceToken)
          return
        }
      }

      setSourceToken(sourceAssets[0])
    }
  }, [sourceAssets.length, sourceAssets, sourceChain])

  /**
   * set destination token
   */
  useEffect(() => {
    if (destinationAssets && destinationAssets.length > 0 && !isSwitchedRef.current) {
      if (destinationChain) {
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
  }, [destinationAssets.length, destinationAssets, destinationChain])

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
  )

  const { userAddresses, userAddressesError } = useAddresses(
    routeResponse?.response.chain_ids as string[],
  )

  const options = useMemo(() => {
    return {
      slippageTolerancePercent: String(slippagePercent),
    }
  }, [slippagePercent])

  const { messages } = useMessages(userAddresses, routeResponse?.response, options)
  const { data: skipGasFee } = useSKIPGasFeeSWR(messages, userAddresses)

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
  const { data: feeTokenFiatValue } = useQuery(
    ['fee-token-fiat-value', feeDenom],
    async () => {
      return fetchCurrency(
        '1',
        feeDenom.coinGeckoId,
        feeDenom.chain as SupportedChain,
        currencyDetail[preferredCurrency].currencyPointer,
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
    if (sourceToken && Number(inAmount) > Number(sourceToken.amount)) {
      return true
    }

    return false
  }, [inAmount, sourceToken])

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
    sourceToken,
    sourceChain,
    handleInAmountChange,
    sourceAssets,
    chainsToShow,
    amountExceedsBalance,
    amountOut,
    destinationToken,
    destinationChain,
    destinationAssets,
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
    setGasOption,
    setFeeDenom,
    displayFee,
    route: {
      ...(routeResponse ?? {}),
      messages: messages ?? [],
      userAddresses: userAddresses ?? [],
    },
    impactedPriceValue,
    setImpactedPriceValue,
    refresh,
    handleSwitchOrder,
    isSwitchOrderPossible,
    slippagePercent,
    setSlippagePercent,
    setInAmount,
  }
}
