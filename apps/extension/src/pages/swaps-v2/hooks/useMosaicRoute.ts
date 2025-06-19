import { isAptosChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  AffiliateFeesByChainId,
  getDecimalPower10,
  MosaicAPI,
  MosaicPath,
  MosaicQuoteResponse,
} from '@leapwallet/elements-core'
import { RouteAggregator, RouteError, SkipSupportedChainData } from '@leapwallet/elements-hooks'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { Wallet } from 'hooks/wallet/useWallet'

import { MergedAsset } from './useAssets'

export const MOSAIC_AGGREGATOR = RouteAggregator.MOSAIC
export type MosaicAggregator = typeof MOSAIC_AGGREGATOR

export type MosaicRouteQueryResponse = {
  aggregator: MosaicAggregator
  feeAmount: number
  isFeeIn: boolean
  sourceAssetChain: SkipSupportedChainData
  sourceAsset: MergedAsset
  paths: MosaicQuoteResponse['data']['paths']
  destinationAssetChain: SkipSupportedChainData
  destinationAsset: MergedAsset
  amountIn: string
  amountOut: string
  transactionCount: number
  response: MosaicQuoteResponse['data']
  operations: MosaicPath[]
}

export type MosaicRouteResponse = {
  routeResponse: MosaicRouteQueryResponse | null
  routeError?: RouteError
  isLoadingRoute: boolean
  refresh: () => Promise<void>
  isAptos: boolean
}

export const useMosaicRoute = ({
  enabled = true,
  amountIn,
  sourceAsset,
  sourceAssetChain,
  destinationAsset,
  destinationAssetChain,
  smartRelay = false,
  isDirectTransfer,
  sourceChainAddress,
  integrator,
  leapFeeBps,
  maxPriceImpact,
  slippage,
  affiliateFeesByChainId,
}: {
  enabled?: boolean
  smartRelay: boolean
  amountIn: string
  sourceAsset?: MergedAsset
  sourceAssetChain?: SkipSupportedChainData
  destinationAsset?: MergedAsset
  destinationAssetChain?: SkipSupportedChainData
  isDirectTransfer?: boolean
  sourceChainAddress?: string
  integrator?: string
  leapFeeBps?: string
  maxPriceImpact?: number
  slippage?: number
  affiliateFeesByChainId?: AffiliateFeesByChainId
}): MosaicRouteResponse => {
  const getAptosSigner = Wallet.useAptosSigner()
  const isAptos =
    sourceAsset &&
    destinationAsset &&
    isAptosChain(sourceAsset?.chainId) &&
    isAptosChain(destinationAsset?.chainId)

  const {
    data: routeResponse,
    isLoading: isLoadingRoute,
    error: routeError,
    refetch: refreshRoute,
  } = useQuery({
    enabled: isAptos && enabled,
    queryKey: [
      'mosaic-route',
      amountIn,
      sourceAsset,
      sourceAssetChain,
      destinationAsset,
      destinationAssetChain,
      smartRelay,
      isDirectTransfer,
      sourceChainAddress,
      integrator,
      leapFeeBps,
      maxPriceImpact,
      slippage,
    ],
    queryFn: async (): Promise<MosaicRouteQueryResponse | null> => {
      if (
        !amountIn ||
        !sourceAsset ||
        !sourceAssetChain ||
        !destinationAsset ||
        !destinationAssetChain ||
        !isAptos
      ) {
        return null
      }

      if (!isDirectTransfer && sourceAsset.originDenom === destinationAsset.originDenom) {
        throw new RouteError('Source and destination token cannot be same')
      }

      const amountInBN = new BigNumber(amountIn)

      if (amountInBN.isNaN() || amountInBN.isZero() || amountInBN.isNegative()) {
        throw new RouteError('Please enter a valid amount')
      }

      if (!sourceAsset?.decimals || !destinationAsset?.decimals) {
        throw new RouteError('Asset metadata unavailable')
      }

      const aptosSigner = await getAptosSigner('movement')

      const mosaicResponse = await MosaicAPI.getRoute({
        amountIn,
        slippage,
        destinationAsset,
        destinationAssetChain,
        sourceAsset,
        sourceAssetChain,
        sender: aptosSigner.address.toString(),
        leapFeeBps,
        affiliateFeesByChainId,
      })

      if (!mosaicResponse.success) {
        throw new Error('No data')
      }

      return {
        sourceAssetChain,
        sourceAsset,
        destinationAssetChain,
        destinationAsset,
        amountIn,
        aggregator: RouteAggregator.MOSAIC,
        feeAmount: mosaicResponse.route.feeAmount,
        isFeeIn: mosaicResponse.route.isFeeIn,
        paths: mosaicResponse.route.paths,
        transactionCount: 1,
        operations: mosaicResponse.route.operations.flat() ?? [],
        response: mosaicResponse.route,
        amountOut: String(
          new BigNumber(mosaicResponse.route.dstAmount).dividedBy(
            getDecimalPower10(destinationAsset?.evmDecimals ?? destinationAsset?.decimals ?? 6),
          ),
        ),
      }
    },
    retry: (_failureCount, error) => {
      return !(error instanceof RouteError)
    },
  })

  return {
    isAptos: isAptos ?? false,
    routeResponse: routeResponse ?? null,
    routeError: routeError as RouteError,
    isLoadingRoute: isLoadingRoute,
    refresh: async () => {
      await refreshRoute()
    },
  }
}
