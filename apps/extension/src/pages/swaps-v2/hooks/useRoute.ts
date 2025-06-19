import { isAptosChain } from '@leapwallet/cosmos-wallet-sdk'
import { BRIDGES, RouteResponse, SwapVenue } from '@leapwallet/elements-core'
import {
  RouteAggregator,
  RouteError,
  SkipSupportedChainData,
  useRouteV2,
} from '@leapwallet/elements-hooks'
import { useMemo } from 'react'
import { SWRConfiguration } from 'swr'

import { MergedAsset } from './useAssets'
import { MosaicRouteQueryResponse, useMosaicRoute } from './useMosaicRoute'
import { useProviderFeatureFlags } from './useProviderFeatureFlags'

export type SkipRouteResponse = {
  aggregator: RouteAggregator.SKIP
  response: RouteResponse
  sourceAssetChain: SkipSupportedChainData
  sourceAsset: MergedAsset
  destinationAssetChain: SkipSupportedChainData
  destinationAsset: MergedAsset
  transactionCount: number
  operations: any[]
  amountIn: string
  amountOut: string
}

function useSkipRoute(
  {
    amountIn,
    sourceAsset,
    sourceAssetChain,
    destinationAsset,
    destinationAssetChain,
    enabled = true,
    allowedBridges,
    swapVenues,
    enableSmartSwap,
    enableEvmSwap,
    enableGoFast,
    smartRelay = false,
    isDirectTransfer,
    isSwapFeeEnabled,
    leapFeeAddresses,
    leapFeeBps,
  }: {
    enabled: boolean
    smartRelay: boolean
    amountIn: string
    sourceAsset?: MergedAsset
    sourceAssetChain?: SkipSupportedChainData
    destinationAsset?: MergedAsset
    destinationAssetChain?: SkipSupportedChainData
    allowedBridges?: BRIDGES[]
    swapVenues?: SwapVenue[]
    enableSmartSwap?: boolean
    enableEvmSwap?: boolean
    enableGoFast?: boolean
    isDirectTransfer?: boolean
    isSwapFeeEnabled?: boolean
    leapFeeAddresses?: Record<string, string>
    leapFeeBps: string
  },
  config?: SWRConfiguration,
) {
  /**
   * element hooks
   */
  const {
    amountOut: amountOutWithFees,
    routeResponse: routeResponseWithFees,
    routeError: routeErrorWithFees,
    isLoadingRoute: loadingRoutesWithFees,
    refresh: refreshRouteWithFees,
  } = useRouteV2(
    {
      amountIn,
      sourceAsset,
      sourceAssetChain,
      destinationAsset,
      destinationAssetChain,
      enabled: enabled && !!isSwapFeeEnabled,
      allowedBridges,
      swapVenues,
      enableSmartSwap,
      smartRelay,
      isDirectTransfer,
      basisPointsFees: leapFeeBps,
      enableEvmSwap,
      enableGoFast,
    },
    config,
  )

  const {
    amountOut: amountOutWithoutFees,
    routeResponse: routeResponseWithoutFees,
    routeError: routeErrorWithoutFees,
    isLoadingRoute: loadingRoutesWithoutFees,
    refresh: refreshRouteWithoutFees,
  } = useRouteV2(
    {
      amountIn,
      sourceAsset,
      sourceAssetChain,
      destinationAsset,
      destinationAssetChain,
      enabled,
      allowedBridges,
      swapVenues,
      enableSmartSwap,
      enableEvmSwap,
      enableGoFast,
      smartRelay,
      isDirectTransfer,
      basisPointsFees: undefined,
    },
    config,
  )

  const {
    amountOut,
    routeResponse,
    routeError,
    isLoadingRoute,
    refresh,
    appliedLeapFeeBps,
  }: {
    amountOut: string
    routeResponse: undefined | SkipRouteResponse
    routeError: RouteError
    isLoadingRoute: boolean
    refresh: () => Promise<void>
    appliedLeapFeeBps: string
  } = useMemo(() => {
    const finalResponse = {
      isLoadingRoute: isSwapFeeEnabled
        ? loadingRoutesWithoutFees || loadingRoutesWithFees
        : loadingRoutesWithoutFees,
      appliedLeapFeeBps: '0',
      amountOut: amountOutWithoutFees,
      routeResponse: routeResponseWithoutFees
        ? ({ ...routeResponseWithoutFees, aggregator: RouteAggregator.SKIP } as const)
        : undefined,
      routeError: routeErrorWithoutFees,
      refresh: refreshRouteWithoutFees,
    }
    if (!isSwapFeeEnabled) {
      return {
        ...finalResponse,
        isLoadingRoute: loadingRoutesWithoutFees,
      }
    }
    if (routeResponseWithFees) {
      if ('does_swap' in routeResponseWithFees.response) {
        let lastSwapVenue = routeResponseWithFees.response.swap_venue
        if (!lastSwapVenue) {
          lastSwapVenue =
            routeResponseWithFees.response.swap_venues?.[
              routeResponseWithFees.response.swap_venues.length - 1
            ]
        }
        const swapChainId = lastSwapVenue?.chain_id
        if (leapFeeAddresses && swapChainId && leapFeeAddresses[swapChainId]) {
          return {
            ...finalResponse,
            amountOut: amountOutWithFees,
            routeResponse: routeResponseWithFees
              ? ({ ...routeResponseWithFees, aggregator: RouteAggregator.SKIP } as const)
              : undefined,
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
    isSwapFeeEnabled,
    loadingRoutesWithoutFees,
    loadingRoutesWithFees,
    amountOutWithoutFees,
    routeResponseWithoutFees,
    routeErrorWithoutFees,
    refreshRouteWithoutFees,
    routeResponseWithFees,
    routeErrorWithFees,
    leapFeeAddresses,
    amountOutWithFees,
    leapFeeBps,
    refreshRouteWithFees,
  ])

  return {
    routeResponse,
    routeError,
    amountOut,
    isLoadingRoute,
    refresh,
    appliedLeapFeeBps,
  }
}

/**
 * Aggregated Route with fees, extension of useRouteV2
 */

type BasicRouteResponse = {
  routeError: RouteError | undefined
  amountOut: string
  isLoadingRoute: boolean
  refresh: () => Promise<void>
  appliedLeapFeeBps: string
}

export type AggregatedRouteResponse = BasicRouteResponse & {
  routeResponse: undefined | SkipRouteResponse | MosaicRouteQueryResponse
}

export const useAggregatedRoute = (
  {
    amountIn,
    sourceAsset,
    sourceAssetChain,
    destinationAsset,
    destinationAssetChain,
    enabled = true,
    allowedBridges,
    swapVenues,
    enableSmartSwap,
    enableEvmSwap,
    enableGoFast,
    smartRelay = false,
    isDirectTransfer,
    leapFeeAddresses,
    leapFeeBps,
    isSwapFeeEnabled,
    slippage,
  }: {
    enabled: boolean
    smartRelay: boolean
    amountIn: string
    sourceAsset?: MergedAsset
    sourceAssetChain?: SkipSupportedChainData
    destinationAsset?: MergedAsset
    destinationAssetChain?: SkipSupportedChainData
    allowedBridges?: BRIDGES[]
    swapVenues?: SwapVenue[]
    enableSmartSwap?: boolean
    enableEvmSwap?: boolean
    enableGoFast?: boolean
    isDirectTransfer?: boolean
    isSwapFeeEnabled?: boolean
    leapFeeAddresses?: Record<string, string>
    leapFeeBps: string
    maxPriceImpact?: number
    slippage?: number
  },
  config?: SWRConfiguration,
): AggregatedRouteResponse => {
  const { isSkipEnabled } = useProviderFeatureFlags()
  const isAptos =
    sourceAsset &&
    destinationAsset &&
    isAptosChain(sourceAsset?.chainId) &&
    isAptosChain(destinationAsset?.chainId)

  const {
    routeResponse: skipRouteResponse,
    routeError: skipRouteError,
    amountOut: skipAmountOut,
    isLoadingRoute: skipIsLoadingRoute,
    refresh: skipRefresh,
    appliedLeapFeeBps: skipAppliedLeapFeeBps,
  } = useSkipRoute(
    {
      amountIn,
      sourceAsset,
      sourceAssetChain,
      destinationAsset,
      destinationAssetChain,
      enabled: enabled && isSkipEnabled && !isAptos,
      allowedBridges,
      swapVenues,
      enableSmartSwap,
      enableEvmSwap,
      enableGoFast,
      smartRelay,
      isDirectTransfer,
      leapFeeAddresses,
      leapFeeBps,
      isSwapFeeEnabled,
    },
    config,
  )

  const {
    routeResponse: mosaicRouteResponse,
    routeError: mosaicRouteError,
    isLoadingRoute: isMosaicLoadingRoute,
    refresh: refreshMosaicRoute,
  } = useMosaicRoute({
    enabled,
    amountIn,
    sourceAsset,
    sourceAssetChain,
    destinationAsset,
    destinationAssetChain,
    smartRelay,
    slippage,
    leapFeeBps,
    affiliateFeesByChainId:
      sourceAsset && leapFeeAddresses
        ? {
            [sourceAsset.chainId]: {
              affiliates: [
                { basis_points_fee: leapFeeBps, address: leapFeeAddresses[sourceAsset.chainId] },
              ],
              totalBasisPoints: Number(leapFeeBps),
            },
          }
        : undefined,
  })

  return useMemo(() => {
    /**
     * Logic to decide which route to use based on route responses and amountOuts
     * If skip route is not available, use lifi route
     * If skip route is available, use it
     * If both are available, use the one with the higher amountOut
     * If both have the same amountOut, use the skip route
     * If both are not available, return undefined
     */
    const defaultResponse = {
      appliedLeapFeeBps: skipAppliedLeapFeeBps ?? '0',
      routeResponse: skipRouteResponse,
      routeError: skipRouteError,
      amountOut: skipAmountOut,
      isLoadingRoute: skipIsLoadingRoute,
      refresh: skipRefresh,
    }

    if (isAptos && mosaicRouteResponse) {
      return {
        routeError: mosaicRouteError,
        amountOut: mosaicRouteResponse.amountOut,
        isLoadingRoute: isMosaicLoadingRoute,
        refresh: refreshMosaicRoute,
        appliedLeapFeeBps: leapFeeBps,
        routeResponse: mosaicRouteResponse,
      }
    }

    // skip route is available and has higher amountOut
    return defaultResponse
  }, [
    skipAppliedLeapFeeBps,
    skipRouteResponse,
    skipRouteError,
    skipAmountOut,
    skipIsLoadingRoute,
    skipRefresh,
    isAptos,
    mosaicRouteResponse,
    mosaicRouteError,
    isMosaicLoadingRoute,
    refreshMosaicRoute,
    leapFeeBps,
  ])
}
