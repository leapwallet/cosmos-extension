import { useActiveChain, useIsFeatureExistForChain } from '@leapwallet/cosmos-wallet-hooks'
import { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { ComingSoon } from 'components/coming-soon'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import React from 'react'
import { activeChainStore } from 'stores/active-chain-store'
import { activityStore } from 'stores/activity-store'
import { aggregatedChainsStore } from 'stores/balance-store'
import { chainTagsStore } from 'stores/chain-infos-store'
import { selectedNetworkStore } from 'stores/selected-network-store'
import { AggregatedSupportedChain } from 'types/utility'

import { AggregatedActivity, ChainActivity } from './components'

export default function Activity() {
  // usePageView(PageName.Activity)
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const isActivityComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'activity',
    platform: 'Extension',
  })

  if (activeChain === AGGREGATED_CHAIN_KEY) {
    return (
      <AggregatedActivity
        chainTagsStore={chainTagsStore}
        aggregatedChainsStore={aggregatedChainsStore}
        selectedNetworkStore={selectedNetworkStore}
      />
    )
  }

  if (isActivityComingSoon) {
    return (
      <ComingSoon
        title='Activity'
        bottomNavLabel={BottomNavLabel.Activity}
        chainTagsStore={chainTagsStore}
      />
    )
  }

  return (
    <ChainActivity
      chainTagsStore={chainTagsStore}
      activityStore={activityStore}
      activeChainStore={activeChainStore}
      selectedNetworkStore={selectedNetworkStore}
    />
  )
}
