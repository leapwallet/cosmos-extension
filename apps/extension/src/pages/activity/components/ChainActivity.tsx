import { ActivityCardContent, useAddress } from '@leapwallet/cosmos-wallet-hooks'
import {
  ActiveChainStore,
  ActivityStore,
  AddressStore,
  ChainTagsStore,
  SelectedNetworkStore,
} from '@leapwallet/cosmos-wallet-store'
import type { ParsedTransaction } from '@leapwallet/parser-parfait'
import { QueryStatus } from '@tanstack/react-query'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'

import { GeneralActivity } from './index'

export type SelectedTx = {
  parsedTx: ParsedTransaction
  content: ActivityCardContent
}

type ChainActivityProps = {
  chainTagsStore: ChainTagsStore
  activityStore: ActivityStore
  activeChainStore: ActiveChainStore
  selectedNetworkStore: SelectedNetworkStore
}

const ChainActivity = observer(
  ({
    chainTagsStore,
    activityStore,
    activeChainStore,
    selectedNetworkStore,
  }: ChainActivityProps) => {
    const activeChain = activeChainStore.activeChain
    const selectedNetwork = selectedNetworkStore.selectedNetwork
    const address = useAddress(activeChain === AGGREGATED_CHAIN_KEY ? 'cosmos' : activeChain)

    const loadingStatus = activityStore.getLoadingStatus(activeChain, selectedNetwork, address)
    const errorStatus = activityStore.getErrorStatus(activeChain, selectedNetwork, address)

    const queryStatus = useMemo(() => {
      let status = loadingStatus === 'loading' ? 'loading' : 'success'
      status = errorStatus ? 'error' : status

      return status
    }, [errorStatus, loadingStatus])

    usePerformanceMonitor({
      page: 'activity',
      queryStatus: queryStatus as QueryStatus,
      op: 'activityPageLoad',
      description: 'loading state on activity page',
    })

    return <GeneralActivity chainTagsStore={chainTagsStore} activityStore={activityStore} />
  },
)

ChainActivity.displayName = 'ChainActivity'
export { ChainActivity }
