import {
  SkipRouteResponse,
  UseAggregatedRouteResponse,
  useBridgeFee,
  useRelayerFee,
  UseRouteResponse,
} from '@leapwallet/elements-hooks'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'

import { MosaicRouteQueryResponse } from './useMosaicRoute'

export function useAggregatorBridgeRelayerFee(
  routeResponse: SkipRouteResponse | MosaicRouteQueryResponse | undefined,
) {
  const skipBridgeFee = useBridgeFee(routeResponse as UseRouteResponse)

  const relayerFee = useRelayerFee(routeResponse as UseAggregatedRouteResponse)

  const bridgeFee = skipBridgeFee

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
