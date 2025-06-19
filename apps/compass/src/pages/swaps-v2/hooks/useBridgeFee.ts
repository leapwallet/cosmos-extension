import {
  LifiRouteOverallResponse,
  RouteAggregator,
  SkipRouteResponse,
  UseAggregatedRouteResponse,
  useBridgeFee,
  useLifiBridgeFee,
  useRelayerFee,
  UseRouteResponse,
} from '@leapwallet/elements-hooks'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'

export function useAggregatorBridgeRelayerFee(
  routeResponse: LifiRouteOverallResponse | SkipRouteResponse | undefined,
) {
  const skipBridgeFee = useBridgeFee(routeResponse as UseRouteResponse)
  const lifiBridgeFee = useLifiBridgeFee(routeResponse as UseAggregatedRouteResponse)

  const relayerFee = useRelayerFee(routeResponse as UseAggregatedRouteResponse)

  const bridgeFee = useMemo(() => {
    if (routeResponse?.aggregator === RouteAggregator.LIFI) {
      return lifiBridgeFee
    }
    return skipBridgeFee
  }, [routeResponse, skipBridgeFee, lifiBridgeFee])

  const totalBridgeFee = useMemo(() => {
    let _totalBridgeFee = new BigNumber(0)
    if (bridgeFee) {
      bridgeFee.usdBridgeFees.forEach((fee) => {
        if (fee) {
          _totalBridgeFee = _totalBridgeFee.plus(fee)
        }
      })
    }
    if (relayerFee) {
      if (relayerFee.usdGasFees) {
        _totalBridgeFee = _totalBridgeFee.plus(relayerFee.usdGasFees)
      }
    }
    if (_totalBridgeFee.gt(0)) {
      return _totalBridgeFee.toString()
    }
    return null
  }, [bridgeFee, relayerFee])

  return {
    bridgeFee,
    relayerFee,
    totalBridgeFee,
  }
}
