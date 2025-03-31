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

//const persister = createAsyncStoragePersister({
//  storage: {
//    setItem(key: string, value: unknown) {
//      return new Promise((resolve) =>
//        chrome.storage.local.set({ [key]: JSON.stringify(value) }, resolve),
//      )
//    },
//    getItem(key: string) {
//      return new Promise((resolve) => {
//        chrome.storage.local.get([key], (result) => {
//          let data = result[key]
//          if (data) data = JSON.parse(data)
//          resolve(data)
//        })
//      })
//    },
//    removeItem(key: string) {
//      return new Promise((resolve) => (chrome.storage.local.remove([key]), resolve))
//    },
//  },
//})
if (process.env.SENTRY_DSN) {
  Sentry.init(
    createSentryConfig({
      dsn: process.env.SENTRY_DSN,
      environment: `${process.env.NODE_ENV}`,
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
      enabled: process.env.NODE_ENV === 'production',
    }),
  )
}

mixpanel.init(process.env.MIXPANEL_TOKEN as string, {
  ip: false,
  debug: process.env.NODE_ENV === 'development',
  ignore_dnt: process.env.NODE_ENV === 'development',
  batch_requests: window.location.href.includes('sign') ? false : true,
  batch_flush_interval_ms: 1000 * 30,
})

// if (process.env.NODE_ENV === 'development') {
//   import('./dev-watcher-client')
//     .then(({ DevWatcherClient }) => {
//       new DevWatcherClient()
//     })
//     .catch((e) => {
//       // eslint-disable-next-line no-console
//       console.warn('DevWatcher Connection Failed', e)
//     })
// }
//
setInterval(() => {
  if (document.hasFocus()) {
    browser.runtime.sendMessage({ type: 'popup-ping', data: { timestamp: Date.now() } })
  }
}, 1000)

ReactDOM.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary beforeCapture={beforeCapture} fallback={<ErrorBoundaryFallback />}>
      <LeapUiTheme defaultTheme={ThemeName.SYSTEM}>
        {/* <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}> */}
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
        {/* </PersistQueryClientProvider> */}
      </LeapUiTheme>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root'),
)
