import { EventHint } from '@sentry/browser'
import { Breadcrumb, Event, Scope } from '@sentry/react'

export const uiErrorTags = {
  uiError: true,
}

const SENTRY_SERVER_ERROR_REGEX = new RegExp(
  /.*HTTP Client Error with status code: (50[0-2]|52[0-4]|530).*/,
  'i',
)

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

export const beforeSend = (event: Event, hint: EventHint) => {
  event.user?.ip_address && delete event.user.ip_address
  event.user?.username && delete event.user.username
  event.user?.email && delete event.user.email

  if (event.message?.includes('closeTransport called before connection was established')) {
    return null
  }

  const errorMessage = event.exception?.values?.[0]?.value
  if (SENTRY_SERVER_ERROR_REGEX.test(errorMessage ?? '')) {
    return null
  }

  const filteredBreadcrumbs = event.breadcrumbs?.filter((breadcrumb) => {
    if (breadcrumb.category === 'console') return false

    if (breadcrumb.data) {
      const { status_code, url } = breadcrumb.data

      const isFetchSuccess = status_code === 200 || status_code === 304
      const isAssetsUrl = typeof url === 'string' && url.includes('assets.leapwallet.io')
      return !(isFetchSuccess && isAssetsUrl)
    }

    return true
  })

  const filteredEvent: Event = {
    ...event,
    breadcrumbs: filteredBreadcrumbs,
    user: event.user
      ? {
          id: event.user.id,
          ip_address: undefined,
          username: undefined,
          email: undefined,
        }
      : undefined,
  }

  return filteredEvent
}

export const beforeSendTransaction = (event: Event, hint: EventHint) => {
  if (event?.user?.ip_address) {
    delete event.user.ip_address
  }

  const filteredSpans = event.spans?.filter((span) => {
    if (span.data.type === 'console') return false
    const isFetchSuccess =
      span.tags?.[`http.status_code`] == 200 || span.tags?.[`http.status_code`] == 304
    const isAssetsUrl =
      typeof span.data.url === 'string' && span.data.url.includes('assets.leapwallet.io')
    return !(isFetchSuccess && isAssetsUrl)
  })

  const filteredBreadcrumbs = event.breadcrumbs?.filter((breadcrumb) => {
    if (breadcrumb.category === 'console') return false

    if (breadcrumb.data) {
      const { status_code, url } = breadcrumb.data

      const isFetchSuccess = status_code === 200 || status_code === 304
      const isAssetsUrl = typeof url === 'string' && url.includes('assets.leapwallet.io')
      return !(isFetchSuccess && isAssetsUrl)
    }

    return true
  })

  const filteredEvent: Event = {
    ...event,
    breadcrumbs: filteredBreadcrumbs,
    spans: filteredSpans,
    user: event.user
      ? {
          id: event.user.id,
          ip_address: undefined,
          username: undefined,
          email: undefined,
        }
      : undefined,
  }

  return filteredEvent
}

export const beforeSendBreadcrumb = (breadcrumb: Breadcrumb) => {
  if (breadcrumb.category === 'console') return null

  if (breadcrumb.data) {
    const { status_code, url } = breadcrumb.data

    const isFetchSuccess = status_code === 200 || status_code === 304
    const isAssetsUrl = typeof url === 'string' && url.includes('assets.leapwallet.io')
    if (isFetchSuccess && isAssetsUrl) return null
  }

  return breadcrumb
}
