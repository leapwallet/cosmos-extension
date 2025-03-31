import { Scope } from '@sentry/react'

export const uiErrorTags = {
  uiError: true,
}

export const beforeCapture = (scope: Scope, error: Error | null, componentStack: string | null) => {
  scope.addBreadcrumb({
    category: 'fatal-error',
    message: error?.message,
    level: 'error',
    data: {
      componentStack,
      errorStack: error?.stack,
    },
  })
  scope.setTag('extension-crash', 'true')
}
