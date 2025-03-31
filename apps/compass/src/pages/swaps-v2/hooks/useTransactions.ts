import {
  RouteAggregator,
  SkipMsg,
  SkipMsgV2,
  useLifiTransactions,
  useMosaicTransactions,
  useTransactions as useSkipTransactions,
} from '@leapwallet/elements-hooks'

import { RoutingInfo } from './useSwapsTx'

export function useTransactions(routingInfo: RoutingInfo) {
  const { groupedTransactions: skipGroupedTransactions, actions: skipActions } =
    useSkipTransactions(
      !!routingInfo?.route && routingInfo?.aggregator === RouteAggregator.SKIP
        ? {
            ...routingInfo.route,
            messages: routingInfo.messages as SkipMsgV2[] | SkipMsg[] | undefined,
          }
        : null,
    )

  const { groupedTransactions: lifiGroupedTransactions, actions: lifiActions } =
    useLifiTransactions(
      //@ts-expect-error relay is not supported?
      routingInfo?.route?.aggregator === RouteAggregator.LIFI ? routingInfo.route : null,
    )

  const { groupedTransactions: mosaicGroupedTransactions, actions: mosaicActions } =
    useMosaicTransactions(
      //@ts-expect-error relay is not supported?
      routingInfo?.route?.aggregator === RouteAggregator.MOSAIC ? routingInfo.route : null,
    )

  if (routingInfo?.route?.aggregator === RouteAggregator.LIFI) {
    return {
      groupedTransactions: lifiGroupedTransactions,
      actions: lifiActions,
    }
  }

  if (routingInfo?.route?.aggregator === RouteAggregator.MOSAIC) {
    return {
      groupedTransactions: mosaicGroupedTransactions,
      actions: mosaicActions,
    }
  }

  return {
    groupedTransactions: skipGroupedTransactions,
    actions: skipActions,
  }
}
