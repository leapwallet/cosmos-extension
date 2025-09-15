import { WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { isAptosChain, pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk'
import {
  BRIDGES,
  getDecimalPower10,
  IncludedStep,
  LifiAPI,
  LifiRouteRequest,
  LifiRouteResponse,
  RouteResponse,
  SwapVenue,
} from '@leapwallet/elements-core'
import {
  RouteAggregator,
  RouteError,
  SkipSupportedChainData,
  useRouteV2,
} from '@leapwallet/elements-hooks'
import BigNumber from 'bignumber.js'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useMemo } from 'react'
import { compassSeiEvmConfigStore } from 'stores/balance-store'
import useSWR, { SWRConfiguration, unstable_serialize, useSWRConfig } from 'swr'
import { isCompassWallet } from 'utils/isCompassWallet'

import { MergedAsset } from './useAssets'
import { useProviderFeatureFlags } from './useProviderFeatureFlags'

function onErrorRetry(err: unknown) {
  if (err instanceof RouteError) {
    return false
  }
  return true
}

/**
 * Function to get LIFI Route Quote for an amount, a source token/chain and destination token/chain pair
 */

export type LifiRouteOverallResponse = {
  aggregator: RouteAggregator.LIFI
  response: LifiRouteResponse
  sourceAssetChain: SkipSupportedChainData
  sourceAsset: MergedAsset
  transactionCount: number
  operations: IncludedStep[]
  amountIn: string
  amountOut: string
  destinationAssetChain: SkipSupportedChainData
  destinationAsset: MergedAsset
}

async function getLifiRoute({
  amountIn,
  sourceAsset,
  sourceAssetChain,
  destinationAsset,
  destinationAssetChain,
  enabled,
  smartRelay,
  isDirectTransfer,
  basesPointFee,
  sourceChainAddress,
  integrator,
  feePercentage,
  maxPriceImpact,
  slippage,
  shouldCallLifi = true,
}: {
  amountIn: string
  sourceAsset?: MergedAsset
  sourceAssetChain?: SkipSupportedChainData
  destinationAsset?: MergedAsset
  destinationAssetChain?: SkipSupportedChainData
  enabled?: boolean
  smartRelay: boolean
  isDirectTransfer?: boolean
  basesPointFee?: string
  sourceChainAddress?: string
  shouldCallLifi?: boolean
  integrator?: string
  feePercentage?: number
  slippage?: number
  maxPriceImpact?: number
}) {
  if (!shouldCallLifi) {
    return
  }

  if (
    !amountIn ||
    !sourceAsset ||
    !sourceAssetChain ||
    !destinationAsset ||
    !destinationAssetChain ||
    !enabled
  ) {
    return
    // throw new RouteError('Missing parameters to fetch swap route')
  }

  // Input validation & data preparation pipeline:
  if (!isDirectTransfer && sourceAsset.evmTokenContract === destinationAsset.evmTokenContract) {
    throw new RouteError('Source and destination token cannot be same')
  }

  const amountInBN = new BigNumber(amountIn)

  if (amountInBN.isNaN() || amountInBN.isZero() || amountInBN.isNegative()) {
    throw new RouteError('Please enter a valid amount')
  }

  if (!sourceAsset?.decimals || !destinationAsset?.decimals) {
    throw new RouteError('Asset metadata unavailable')
  }

  const formattedAmountIn = amountInBN
    .multipliedBy(getDecimalPower10(sourceAsset.evmDecimals ?? sourceAsset.decimals))
    .toFixed(0, BigNumber.ROUND_FLOOR)

  // LI.FI API route request payload preparation:
  const lifiRouteData: LifiRouteRequest = {
    source_wallet_address: sourceChainAddress ?? undefined,
    source_asset_denom:
      sourceAsset.evmTokenContract ?? sourceAsset.tokenContract ?? sourceAsset.originDenom,
    source_asset_chain_id: sourceAssetChain.chainId.toString(),
    dest_asset_denom:
      destinationAsset.evmTokenContract ??
      destinationAsset.tokenContract ??
      destinationAsset.originDenom,
    dest_asset_chain_id: destinationAssetChain.chainId.toString(),
    amount_in: formattedAmountIn,
    cumulative_affiliate_fee_bps: basesPointFee ?? '0',
    allow_unsafe: true,
    experimental_features: ['hyperlane', 'cctp'],
    allow_multi_tx: true,
    smart_relay: smartRelay,
    integrator,
    max_price_impact: maxPriceImpact,
    slippage: slippage,
    fee_percentage: feePercentage,
  }

  const lifiResponse:
    | {
        success: false
        error: string
      }
    | {
        success: true
        route: LifiRouteResponse
      } = await LifiAPI.getRoute(lifiRouteData)

  if (lifiResponse.success) {
    const routeResponse: LifiRouteOverallResponse = {
      aggregator: RouteAggregator.LIFI as const,
      sourceAssetChain,
      sourceAsset,
      destinationAssetChain,
      destinationAsset,
      transactionCount: lifiResponse.route.steps.length,
      operations: lifiResponse.route.steps,
      amountIn,
      amountOut: String(
        new BigNumber(lifiResponse.route.toAmount).dividedBy(
          getDecimalPower10(destinationAsset?.evmDecimals ?? destinationAsset?.decimals),
        ),
      ),
      response: lifiResponse.route,
    }
    return routeResponse
  } else {
    throw new RouteError(lifiResponse.error)
  }
}

/**
 * Hook to get LIFI Route Quote for an amount, a source token/chain and destination token/chain pair
 */

function useLifiRoute(
  {
    amountIn,
    sourceAsset,
    sourceAssetChain,
    destinationAsset,
    destinationAssetChain,
    enabled = true,
    smartRelay = false,
    isDirectTransfer,
    sourceChainAddress,
    integrator,
    feePercentage,
    maxPriceImpact,
    slippage,
  }: {
    enabled: boolean
    smartRelay: boolean
    amountIn: string
    sourceAsset?: MergedAsset
    sourceAssetChain?: SkipSupportedChainData
    destinationAsset?: MergedAsset
    destinationAssetChain?: SkipSupportedChainData
    isDirectTransfer?: boolean
    sourceChainAddress?: string
    integrator?: string
    feePercentage?: number
    maxPriceImpact?: number
    slippage?: number
  },
  config?: SWRConfiguration,
) {
  const { mutate } = useSWRConfig()

  const shouldCallLifi = !!isCompassWallet() && enabled

  const key = enabled
    ? unstable_serialize([
        'route',
        sourceAsset?.denom ?? 'source-asset-denom',
        sourceAssetChain?.chainId ?? 'source-chain-id',
        destinationAsset?.denom ?? 'dest-asset-denom',
        destinationAssetChain?.chainId ?? 'dest-chain-id',
        amountIn || 'amountIn',
        isDirectTransfer ? 'direct-transfer' : 'ibc-transfer',
        shouldCallLifi ? 'lifi' : 'no-lifi',
        integrator ? `${integrator}-lifi-integrator` : 'no-lifi-integrator',
        feePercentage ? `${feePercentage}-lifi-fee-percentage` : 'no-lifi-fee-percentage',
      ])
    : null

  const {
    data: routeResponse,
    error: routeError,
    isLoading: isLoadingRoute,
  } = useSWR(
    key,
    () =>
      getLifiRoute({
        amountIn,
        sourceAsset,
        sourceAssetChain,
        destinationAsset,
        destinationAssetChain,
        enabled,
        isDirectTransfer,
        smartRelay,
        sourceChainAddress,
        shouldCallLifi,
        integrator,
        feePercentage,
        maxPriceImpact,
        slippage,
      }),
    config
      ? {
          ...config,
          onErrorRetry,
        }
      : {
          onErrorRetry,
        },
  )

  const amountOut = useMemo(() => {
    if (!routeResponse || !destinationAsset) {
      return '-'
    }

    if (routeResponse?.response?.toAmount) {
      return String(
        new BigNumber(routeResponse.response.toAmount).dividedBy(
          getDecimalPower10(destinationAsset?.evmDecimals ?? destinationAsset?.decimals ?? 6),
        ),
      )
    }

    return amountIn
  }, [amountIn, destinationAsset, routeResponse])

  return useMemo(() => {
    return {
      routeResponse,
      routeError,
      amountOut,
      isLoadingRoute,
      routeKey: key,
      refresh: () => mutate(key),
    } as const
  }, [amountOut, isLoadingRoute, key, mutate, routeError, routeResponse])
}

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
  routeResponse: undefined | SkipRouteResponse | ReturnType<typeof useLifiRoute>['routeResponse']
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
    maxPriceImpact,
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
  const { isLifiEnabled, isSkipEnabled } = useProviderFeatureFlags()
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

  const { activeWallet } = useActiveWallet()
  const walletSupportsEVM =
    activeWallet?.walletType !== WALLETTYPE.LEDGER || activeWallet?.app === 'sei'

  const sei0xAddress =
    activeWallet && walletSupportsEVM
      ? pubKeyToEvmAddressToShow(activeWallet.pubKeys?.['seiTestnet2'])
      : undefined

  const formattedSourceChain = useMemo(() => {
    return sourceAssetChain
      ? ({
          ...sourceAssetChain,
          chainType: 'evm' as 'cosmos',
          chainId: String(compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_ETH_CHAIN_ID),
        } as SkipSupportedChainData)
      : undefined
  }, [sourceAssetChain])

  const formattedDestinationChain = useMemo(() => {
    return destinationAssetChain
      ? ({
          ...destinationAssetChain,
          chainType: 'evm' as 'cosmos',
          chainId: String(compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_ETH_CHAIN_ID),
        } as SkipSupportedChainData)
      : undefined
  }, [destinationAssetChain])

  const sourceAndDestinationBothLifiSupported = useMemo(() => {
    const sourceTokenLifiSupported = !!sourceAsset?.evmTokenContract
    const destinationTokenLifiSupported = !!destinationAsset?.evmTokenContract
    return sourceTokenLifiSupported && destinationTokenLifiSupported
  }, [sourceAsset?.evmTokenContract, destinationAsset?.evmTokenContract])

  const isLifiRouteEnabled = useMemo(() => {
    return (
      enabled &&
      sourceAndDestinationBothLifiSupported &&
      !!isCompassWallet() &&
      walletSupportsEVM &&
      isLifiEnabled
    )
  }, [enabled, sourceAndDestinationBothLifiSupported, walletSupportsEVM, isLifiEnabled])

  const {
    routeResponse: lifiRouteResponse,
    routeError: lifiRouteError,
    amountOut: lifiAmountOut,
    isLoadingRoute: lifiIsLoadingRoute,
    refresh: lifiRefresh,
  } = useLifiRoute(
    {
      amountIn,
      sourceAsset,
      sourceAssetChain: formattedSourceChain,
      destinationAsset,
      destinationAssetChain: formattedDestinationChain,
      enabled: isLifiRouteEnabled,
      smartRelay,
      isDirectTransfer,
      sourceChainAddress: sei0xAddress,
      integrator: 'compasswallet',
      feePercentage: leapFeeBps ? Number(leapFeeBps) / 100 : undefined,
      maxPriceImpact,
      slippage,
    },
    config,
  )

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

    if (lifiRouteResponse) {
      // lifi route is available and either skip route is not available or has lower amountOut
      return {
        routeResponse: lifiRouteResponse,
        routeError: lifiRouteError,
        amountOut: lifiAmountOut,
        isLoadingRoute: lifiIsLoadingRoute || skipIsLoadingRoute,
        refresh: async () => {
          await Promise.all([lifiRefresh(), skipRefresh()])
        },
        appliedLeapFeeBps: leapFeeBps,
      }
    }

    // Skip route is available and has higher amountOut and isCompassWallet consider LIFI Route Loading and Refresh
    if (isCompassWallet()) {
      return {
        ...defaultResponse,
        isLoadingRoute: lifiIsLoadingRoute || skipIsLoadingRoute,
        routeError: lifiIsLoadingRoute ? undefined : skipRouteError,
        refresh: async () => {
          await Promise.all([lifiRefresh(), skipRefresh()])
        },
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
    lifiRouteResponse,
    leapFeeBps,
    lifiRouteError,
    lifiAmountOut,
    lifiIsLoadingRoute,
    lifiRefresh,
  ])
}
