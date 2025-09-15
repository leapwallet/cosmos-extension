import { useActiveWallet, useAddress, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import {
  AggregatedChainsStore,
  ChainTagsStore,
  SelectedNetworkStore,
} from '@leapwallet/cosmos-wallet-store'
import { QueryStatus } from '@tanstack/react-query'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { useAggregatedChainsToFetch } from 'hooks/useAggregatedChainsToFetch'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { activityStore } from 'stores/activity-store'
import { manageChainsStore } from 'stores/manage-chains-store'

import { GeneralActivity } from './index'

const AggregatedActivity = observer(
  ({
    chainTagsStore,
    aggregatedChainsStore,
    selectedNetworkStore,
  }: {
    chainTagsStore: ChainTagsStore
    aggregatedChainsStore: AggregatedChainsStore
    selectedNetworkStore: SelectedNetworkStore
  }) => {
    const chains = useGetChains()
    const activeWallet = useActiveWallet()
    const chainsToFetch = useAggregatedChainsToFetch(aggregatedChainsStore, manageChainsStore)
    const [selectedChain, setSelectedChain] = useState(chains.cosmos.key)
    const address = useAddress(selectedChain)

    const selectedNetwork = selectedNetworkStore.selectedNetwork

    const activity = activityStore.getActivity(selectedChain, selectedNetwork, address)
    const loadingStatus = activityStore.getLoadingStatus(selectedChain, selectedNetwork, address)
    const errorStatus = activityStore.getErrorStatus(selectedChain, selectedNetwork, address)

    const filteredChains = useMemo(() => {
      return chainsToFetch.map((chain) => chains[chain.chainName].chainRegistryPath)
    }, [chains, chainsToFetch])

    const queryStatus = useMemo(() => {
      let status: QueryStatus = loadingStatus === 'loading' ? 'loading' : 'success'
      status = errorStatus ? 'error' : status

      return status
    }, [errorStatus, loadingStatus])

    usePerformanceMonitor({
      page: `activity-${selectedChain}`,
      queryStatus,
      op: 'activityPageLoad',
      description: 'loading state on activity page',
    })

    return (
      <GeneralActivity
        activityStore={activityStore}
        filteredChains={filteredChains}
        forceNetwork={selectedNetwork}
        forceChain={selectedChain}
        setSelectedChain={setSelectedChain}
        chainTagsStore={chainTagsStore}
      />
    )
  },
)

AggregatedActivity.displayName = 'AggregatedActivity'
export { AggregatedActivity }
