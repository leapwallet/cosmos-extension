import * as Sentry from '@sentry/react'
import { Span } from '@sentry/tracing'
import { Context } from '@sentry/types'
import { QueryStatus } from '@tanstack/react-query'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useEffect, useRef } from 'react'

type usePerformanceMonitorProps = {
  page: string
  queryStatus: QueryStatus
  op: string
  description: string
  enabled?: boolean
  terminateProps?: {
    logData: {
      tags?: {
        [key: string]: boolean | string | number
      }
      context?: Context
    }
    maxDuration: number
  }
}

export function usePerformanceMonitor({
  page,
  queryStatus,
  op,
  description,
  enabled = true,
  terminateProps,
}: usePerformanceMonitorProps) {
  const span = useRef<Span>()
  const activeChain = useActiveChain()
  const hasFinished = useRef(false)
  const timeoutId = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!enabled) {
      return
    }

    const txName = `${page}-page`
    const transaction = Sentry.startTransaction({
      name: txName,
      op,
      description,
      tags: {
        activeChain,
      },
    })
    Sentry.getCurrentHub().configureScope((scope) => scope.setSpan(transaction))
  }, [activeChain, page, enabled, op, description])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const loading = queryStatus === 'loading'
    const success = queryStatus === 'success'
    const error = queryStatus === 'error'

    const transaction = Sentry?.getCurrentHub().getScope()?.getTransaction()
    if (!transaction) {
      return
    }

    if (loading || !span.current) {
      span.current = transaction.startChild()
    }

    if (loading && terminateProps?.maxDuration) {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }

      timeoutId.current = setTimeout(() => {
        if (!hasFinished.current) {
          span.current?.setStatus('internal_error')
          span.current?.finish()
          Object.entries(terminateProps.logData?.tags ?? {}).forEach(([key, value]) =>
            transaction.setTag(key, value),
          )
          Object.entries(terminateProps.logData?.context ?? {}).forEach(([key, value]) =>
            transaction.setContext(key, { [key]: value }),
          )
          transaction?.finish()
        }
        hasFinished.current = true
      }, terminateProps.maxDuration)
    }

    if (hasFinished.current) {
      return
    }

    if (success && span.current) {
      span.current.setStatus('ok')
      span.current.finish()
      transaction?.finish()
      hasFinished.current = true
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }
    }

    if (error && span.current) {
      span.current.setStatus('internal_error')
      span.current.finish()
      transaction?.finish()
      hasFinished.current = true
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description, op, queryStatus, enabled])
}
