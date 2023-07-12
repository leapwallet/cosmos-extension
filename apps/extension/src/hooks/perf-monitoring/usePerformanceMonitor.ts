import { enableLeapNode } from '@leapwallet/cosmos-wallet-hooks'
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
}

export function usePerformanceMonitor({
  page,
  queryStatus,
  op,
  description,
}: usePerformanceMonitorProps) {
  const span = useRef<Span>()
  const activeChain = useActiveChain()

  useEffect(() => {
    const txName = enableLeapNode
      ? `${activeChain}-${page}-page-leap-node`
      : `${activeChain}-${page}-page-public-node`
    const transaction = Sentry.startTransaction({ name: txName })
    Sentry.getCurrentHub().configureScope((scope) => scope.setSpan(transaction))
  }, [activeChain, page])

  useEffect(() => {
    const loading = queryStatus === 'loading'
    const success = queryStatus === 'success'
    const error = queryStatus === 'error'

    if (loading) {
      const transaction = Sentry?.getCurrentHub().getScope()?.getTransaction()

      if (transaction) {
        span.current = transaction.startChild({
          op,
          description,
        })
      }
    }

    if (success && span.current) {
      const transaction = Sentry?.getCurrentHub().getScope()?.getTransaction()
      span.current.setStatus('ok')
      span.current.finish()
      transaction?.finish()
    }

    if (error && span.current) {
      const transaction = Sentry?.getCurrentHub().getScope()?.getTransaction()
      span.current.setStatus('internal_error')
      span.current.finish()
      transaction?.finish()
    }
  }, [description, op, queryStatus])
}
