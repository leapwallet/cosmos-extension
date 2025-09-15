// eslint-disable-next-line simple-import-sort/imports
import '../styles/globals.css'
import { fetchIbcTraceData } from './initializeGlobalConfigs'

import { setSpeculosTransport, setUseSpeculosTransport } from '@leapwallet/cosmos-wallet-sdk'
import { LeapUiTheme, ThemeName } from '@leapwallet/leap-ui'
import { createSentryConfig } from '@leapwallet/sentry-config/dist/extension'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import { QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundaryFallback from 'components/error-boundary-fallback'
import mixpanel from 'mixpanel-browser'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom'
import { beforeCapture } from 'utils/sentry'
import browser from 'webextension-polyfill'

import App from './App'
import { queryClient } from './query-client'

fetchIbcTraceData()

async function importSpeculosTransport() {
  setUseSpeculosTransport(true)
  const SpeculosHttpTransport = await import('@empiricalrun/hw-transport-speculos-http')
  setSpeculosTransport(SpeculosHttpTransport.default)
}

if (process.env.buildType === 'staging') {
  importSpeculosTransport()
}

const isProdBuild = process.env.NODE_ENV === 'production'

if (process.env.SENTRY_DSN) {
  Sentry.init(
    createSentryConfig({
      dsn: process.env.SENTRY_DSN,
      environment: isProdBuild ? 'production' : 'development',
      ignoreErrors: [
        'AxiosError: Network Error',
        'AxiosError: Request aborted',
        'AbortError: Aborted',
        'TypeError: Failed to fetch',
        'TypeError: NetworkError when attempting to fetch resource.',
        'API Unavailable',
      ],
      release: `${browser.runtime.getManifest().version}`,
      integrations: [
        new BrowserTracing({
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            React.useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes,
          ),
        }),
      ],
      sampleRate: 0.3,
      tracesSampleRate: 0.1,
      enabled: isProdBuild,
    }),
  )
}

mixpanel.init(process.env.MIXPANEL_TOKEN as string, {
  ip: false,
  debug: !isProdBuild,
  ignore_dnt: !isProdBuild,
  batch_requests: window.location.href.includes('sign') ? false : true,
  batch_flush_interval_ms: 1000 * 30,
})

setInterval(() => {
  if (document.hasFocus()) {
    browser.runtime.sendMessage({ type: 'popup-ping', data: { timestamp: Date.now() } })
  }
}, 1000)

ReactDOM.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary beforeCapture={beforeCapture} fallback={<ErrorBoundaryFallback />}>
      <LeapUiTheme defaultTheme={ThemeName.DARK}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </LeapUiTheme>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root'),
)
