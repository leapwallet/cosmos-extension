import { useActiveChain, useIsFeatureExistForChain } from '@leapwallet/cosmos-wallet-hooks'
import { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { ComingSoon } from 'components/coming-soon'
import { PageName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { usePageView } from 'hooks/analytics/usePageView'
import React from 'react'
import { chainTagsStore } from 'stores/chain-infos-store'
import { denomsStore } from 'stores/denoms-store-instance'
import { AggregatedSupportedChain } from 'types/utility'

import { AggregatedActivity, ChainActivity } from './components'

export default function Activity() {
  usePageView(PageName.Activity)
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const isActivityComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'activity',
    platform: 'Extension',
  })

  if (activeChain === AGGREGATED_CHAIN_KEY) {
    return <AggregatedActivity chainTagsStore={chainTagsStore} />
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

  return <ChainActivity denomStore={denomsStore} chainTagsStore={chainTagsStore} />
}
