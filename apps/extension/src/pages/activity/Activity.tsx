import { useIsFeatureExistForChain } from '@leapwallet/cosmos-wallet-hooks'
import { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { ComingSoon } from 'components/coming-soon'
import React from 'react'

import { ActivityLandingPage } from './ActivityLandingPage'

export default function Activity() {
  const isActivityComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'activity',
    platform: 'Extension',
  })

  if (isActivityComingSoon) {
    return <ComingSoon title='Activity' bottomNavLabel={BottomNavLabel.Activity} />
  }

  return <ActivityLandingPage />
}
