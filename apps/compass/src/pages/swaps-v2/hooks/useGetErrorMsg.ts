import { useMemo } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

const NO_TRANSACTION_ROUTES_ERROR = 'No transaction routes available'
// Skip's API responses for which to show NO_TRANSACTION_ROUTES_ERROR
const noTransactionRoutesErrors = [
  'no single-tx routes found',
  'no routes found',
  'cannot swap on a chain',
  'cannot transfer across',
  'source token not found',
]

export function isNoRoutesAvailableError(routeError: string | undefined) {
  return routeError?.toLowerCase().includes(NO_TRANSACTION_ROUTES_ERROR?.toLowerCase())
}

export function useGetErrorMsg(
  routeError: Error | undefined,
  sourceToken: SourceToken | null,
  destinationToken: SourceToken | null,
  sourceChain: SourceChain | undefined,
  destinationChain: SourceChain | undefined,
  errorMsg?: string,
) {
  return useMemo(() => {
    if (errorMsg) {
      return errorMsg
    }

    if (routeError) {
      if (
        noTransactionRoutesErrors?.some((error) => routeError.message.toLowerCase().includes(error))
      ) {
        return NO_TRANSACTION_ROUTES_ERROR
      }
      if (routeError.message.toLowerCase().includes('input amount is too low to cover')) {
        return routeError.message
      }
      if (routeError.message.toLowerCase().includes('insufficient allowance')) {
        return 'Insufficient allowance'
      }
      if (routeError.message.toLowerCase().includes('asset metadata unavailable')) {
        return 'Asset not supported'
      }
    }

    if (
      sourceToken &&
      destinationToken &&
      sourceChain &&
      destinationChain &&
      sourceToken.coinMinimalDenom === destinationToken.coinMinimalDenom &&
      sourceChain.chainId === destinationChain.chainId
    ) {
      return 'Source and destination tokens cannot be the same'
    }

    return ''
  }, [destinationChain, destinationToken, errorMsg, routeError, sourceChain, sourceToken])
}
