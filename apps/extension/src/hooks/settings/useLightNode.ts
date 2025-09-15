import * as Sentry from '@sentry/react'
import { useEffect } from 'react'
import { LightNodeStore } from 'stores/light-node-store'

export function useInitLightNode(store: LightNodeStore) {
  useEffect(() => {
    store.initLightNode()
  }, [store])

  useEffect(() => {
    if (store.isLightNodeRunning && !store.isSubscribedToEvents) {
      store.subscribeToEvents()
    }
  }, [store, store.isLightNodeRunning, store.isSubscribedToEvents])

  useEffect(() => {
    if (store.nodeStartError || store.nodeStopError) {
      Sentry.setTag('light-node-status', 'error')
    } else if (store.isLightNodeRunning) {
      Sentry.setTag('light-node-status', 'running')
    } else if (store.syncedPercentage === 100) {
      Sentry.setTag('light-node-status', 'synced')
    } else {
      Sentry.setTag('light-node-status', 'idle')
    }
  }, [store.isLightNodeRunning, store.syncedPercentage, store.nodeStartError, store.nodeStopError])
}
