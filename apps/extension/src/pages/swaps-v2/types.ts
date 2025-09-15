import type { GasOptions } from '@leapwallet/cosmos-wallet-hooks'
import type { GasPrice, NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import type { RouteAggregator, SkipCosmosMsg, SkipMsg, SkipMsgV2 } from '@leapwallet/elements-hooks'
import type { QueryStatus } from '@tanstack/react-query'
import type { GasPriceOptionValue } from 'components/gas-price-options/context'
import type { SourceChain, SourceToken, SwapFeeInfo } from 'types/swap'

import type { MosaicRouteQueryResponse, SkipRouteResponse } from './hooks'

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
  bridgeFeeError: string | null
}
