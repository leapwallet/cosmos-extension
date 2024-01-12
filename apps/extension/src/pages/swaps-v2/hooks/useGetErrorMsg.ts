import { useMemo } from 'react'
import { SourceToken } from 'types/swap'

export function useGetErrorMsg(
  routeError: Error | undefined,
  sourceToken: SourceToken | null,
  destinationToken: SourceToken | null,
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
      sourceToken.coinMinimalDenom === destinationToken.coinMinimalDenom
    ) {
      return 'Source and destination tokens cannot be the same'
    }

    return ''
  }, [destinationToken, errorMsg, routeError, sourceToken])
}
