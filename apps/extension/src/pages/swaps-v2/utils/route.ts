import { RouteAggregator } from '@leapwallet/elements-hooks'

import { MosaicRouteQueryResponse } from '../hooks/useMosaicRoute'
import { SkipRouteResponse } from '../hooks/useRoute'

export function getChainIdsFromRoute(
  route: SkipRouteResponse | MosaicRouteQueryResponse | undefined,
): string[] | undefined {
  if (!route) return undefined

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
  route: SkipRouteResponse | MosaicRouteQueryResponse | undefined,
): number | undefined {
  if (!route) return undefined

  return route.response?.operations?.length
}
