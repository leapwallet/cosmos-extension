import { useIsFeatureExistForChain } from '@leapwallet/cosmos-wallet-hooks'
import { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { ComingSoon } from 'components/coming-soon'
import { NoStake } from 'components/no-stake'
import React from 'react'

import StakePage from './Stake'

export default function Stake() {
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

  if (isStakeComingSoon) {
    return <ComingSoon title='Staking' bottomNavLabel={BottomNavLabel.Stake} />
  }

  if (isStakeNotSupported) {
    return <NoStake />
  }

  return <StakePage />
}
