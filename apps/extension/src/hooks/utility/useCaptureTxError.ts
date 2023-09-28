import * as Sentry from '@sentry/react'
import { useEffect } from 'react'

export function useCaptureTxError(error: string | undefined) {
  useEffect(() => {
    if (error) {
      Sentry.captureException(error)
    }
  }, [error])
}
