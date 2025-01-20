import {
  RouteAggregator,
  SkipMsg,
  SkipMsgV2,
  useLifiTransactions,
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
      routingInfo?.route?.aggregator === RouteAggregator.LIFI ? routingInfo.route : null,
    )

  if (routingInfo?.route?.aggregator === RouteAggregator.LIFI) {
    return {
      groupedTransactions: lifiGroupedTransactions,
      actions: lifiActions,
    }
  }

  return {
    groupedTransactions: skipGroupedTransactions,
    actions: skipActions,
  }
}
