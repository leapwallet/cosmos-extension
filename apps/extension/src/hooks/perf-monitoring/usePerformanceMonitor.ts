import * as Sentry from '@sentry/react'
import { Span } from '@sentry/tracing'
import { QueryStatus } from '@tanstack/react-query'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useEffect, useRef } from 'react'

type usePerformanceMonitorProps = {
  page: string
  queryStatus: QueryStatus
  op: string
  description: string
  enabled?: boolean
}

export function usePerformanceMonitor({
  page,
  queryStatus,
  op,
  description,
  enabled = true,
}: usePerformanceMonitorProps) {
  const span = useRef<Span>()
  const activeChain = useActiveChain()

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

    if (success && span.current) {
      span.current.setStatus('ok')
      span.current.finish()
      transaction?.finish()
    }

    if (error && span.current) {
      span.current.setStatus('internal_error')
      span.current.finish()
      transaction?.finish()
    }
  }, [description, op, queryStatus, enabled])
}
