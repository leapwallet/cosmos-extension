import { useActiveChain, useIsFeatureExistForChain } from '@leapwallet/cosmos-wallet-hooks'
import { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { ComingSoon } from 'components/coming-soon'
import { NoStake } from 'components/no-stake'
import { PageName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { usePageView } from 'hooks/analytics/usePageView'
import React from 'react'
import { AggregatedSupportedChain } from 'types/utility'

import { AggregatedStake, GeneralStake } from './components'

export default function Stake() {
  usePageView(PageName.Stake)
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const isStakeComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'stake',
    platform: 'Extension',
  })

  const isStakeNotSupported = useIsFeatureExistForChain({
    checkForExistenceType: 'notSupported',
    feature: 'stake',
    platform: 'Extension',
  })

  if (activeChain === AGGREGATED_CHAIN_KEY) {
    return <AggregatedStake />
  }

  if (isStakeComingSoon) {
    return <ComingSoon title='Staking' bottomNavLabel={BottomNavLabel.Stake} />
  }

  if (isStakeNotSupported) {
    return <NoStake />
  }

  return <GeneralStake />
}
