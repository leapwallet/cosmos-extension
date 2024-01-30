import { useMemo } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

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

    if (routeError && routeError.message.toLowerCase().includes('error getting route')) {
      return 'No transaction routes available'
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
