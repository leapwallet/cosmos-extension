import { RouteAggregator } from '@leapwallet/elements-hooks'
import { compassSeiEvmConfigStore } from 'stores/balance-store'

import { MosaicRouteQueryResponse } from '../hooks/useMosaicRoute'
import { LifiRouteOverallResponse, SkipRouteResponse } from '../hooks/useRoute'

export function sanitizeChainIdForCompass(chainId: string): string {
  return chainId === String(compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_ETH_CHAIN_ID)
    ? compassSeiEvmConfigStore.compassSeiEvmConfig.PACIFIC_COSMOS_CHAIN_ID
    : chainId
}

export function getChainIdsFromRoute(
  route: LifiRouteOverallResponse | SkipRouteResponse | MosaicRouteQueryResponse | undefined,
): string[] | undefined {
  if (!route) return undefined

  if (route.aggregator === RouteAggregator.LIFI) {
    const chainIds: string[] = []
    route.response.steps.map((step) => {
      if (step.action.fromChainId) {
        chainIds.push(step.action.fromChainId.toString())
      }
      if (step.action.toChainId) {
        chainIds.push(step.action.toChainId.toString())
      }
    })
    if (!chainIds || chainIds?.length === 0) {
      return undefined
    }
    const sanitizedChainIds = chainIds.map((id) => sanitizeChainIdForCompass(id))
    if (new Set(sanitizedChainIds).size === 1) {
      return [sanitizedChainIds[0]]
    }
    return sanitizedChainIds
  }

  if (route.aggregator === RouteAggregator.MOSAIC) {
    const chainIds = route.response?.operations[0].reduce((acc, path) => {
      acc.add(path.srcAssetChainId)
      acc.add(path.dstAssetChainId)

      return acc
    }, new Set<string>())

    return chainIds.size > 0 ? [...chainIds] : undefined
  }

  return route.response?.chain_ids ?? undefined
}

export function getNoOfStepsFromRoute(
  route: LifiRouteOverallResponse | SkipRouteResponse | MosaicRouteQueryResponse | undefined,
): number | undefined {
  if (!route) return undefined

  if (route.aggregator === RouteAggregator.LIFI) {
    return route.response?.steps.length
  }

  return route.response?.operations?.length
}
