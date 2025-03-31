import { ActivityCardContent, useActivity } from '@leapwallet/cosmos-wallet-hooks'
import type { ParsedTransaction } from '@leapwallet/parser-parfait'
import { QueryStatus } from '@tanstack/react-query'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { ankrChainMapStore, ibcTraceFetcher } from 'stores/balance-store'

import { GeneralActivity } from './index'

export type SelectedTx = {
  parsedTx: ParsedTransaction
  content: ActivityCardContent
}

export const ChainActivity = observer(() => {
  const txResponse = useActivity(ankrChainMapStore.ankrChainMap, ibcTraceFetcher)
  const queryStatus = txResponse.error ? 'error' : txResponse.loading ? 'loading' : 'success'

  usePerformanceMonitor({
    page: 'activity',
    queryStatus: queryStatus as QueryStatus,
    op: 'activityPageLoad',
    description: 'loading state on activity page',
  })

  return <GeneralActivity txResponse={txResponse} />
})

ChainActivity.displayName = 'ChainActivity'
