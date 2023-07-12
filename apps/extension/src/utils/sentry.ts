import { Scope } from '@sentry/react'

export const beforeCapture = (scope: Scope, error: Error | null, componentStack: string | null) => {
  scope.addBreadcrumb({
    category: 'fatal-error',
    message: error?.message,
    level: 'error',
    data: {
      componentStack,
    },
  })
  scope.setTag('extension-crash', 'true')
}
