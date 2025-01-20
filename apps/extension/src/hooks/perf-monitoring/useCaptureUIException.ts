import { captureException } from '@sentry/react'
import { useEffect } from 'react'
import { uiErrorTags } from 'utils/sentry'

export const useCaptureUIException = (error?: string | null, tags?: Record<string, string>) => {
  useEffect(() => {
    if (error) {
      captureException(error, {
        tags: { ...uiErrorTags, ...tags },
      })
    }
  }, [error, tags])
}
