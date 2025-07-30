import { CosmosTxType } from '@leapwallet/cosmos-wallet-hooks'
import { RouteAggregator } from '@leapwallet/elements-hooks'

import { MosaicRouteQueryResponse } from '../hooks/useMosaicRoute'
import { SkipRouteResponse } from '../hooks/useRoute'
import { routeDoesSwap } from './priceImpact'

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

export function getTxInfoFromRoute(
  route: SkipRouteResponse | MosaicRouteQueryResponse | undefined,
) {
  if (!route) return { txType: CosmosTxType.IbcSend, bridgeName: undefined }

  if (route.aggregator === RouteAggregator.MOSAIC) {
    return { txType: CosmosTxType.Swap, bridgeName: undefined, provider: 'mosaic_api' }
  }

  const operations = route?.operations
  const hasIBC = !!operations?.some((operation) => 'transfer' in operation)
  const hasSwap = routeDoesSwap(route) || false

  let bridgeName
  for (const operation of operations || []) {
    if ('cctp_transfer' in operation) {
      bridgeName = 'cctp'
      break
    }
    if ('axelar_transfer' in operation) {
      bridgeName = 'axelar'
      break
    }
    if ('go_fast_transfer' in operation) {
      bridgeName = 'go_fast'
      break
    }
    if ('hyperlane_transfer' in operation) {
      bridgeName = 'hyperlane'
      break
    }
    if ('eureka_transfer' in operation) {
      bridgeName = 'eureka'
      break
    }
  }

  let txType = CosmosTxType.IbcSend

  if (hasSwap) {
    txType = CosmosTxType.Swap
    if (bridgeName) {
      txType = CosmosTxType.BridgeSwap
    } else if (hasIBC) {
      txType = CosmosTxType.IBCSwap
    }
  } else {
    if (bridgeName) {
      txType = CosmosTxType.BridgeSend
    } else if (hasIBC) {
      txType = CosmosTxType.IbcSend
    }
  }

  return {
    txType,
    bridgeName,
    provider: 'skip_api',
  }
}
