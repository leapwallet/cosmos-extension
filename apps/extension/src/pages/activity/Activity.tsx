import { useActiveChain, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { ComingSoon } from 'components/coming-soon'
import React from 'react'

import { ActivityLandingPage } from './ActivityLandingPage'

export default function Activity() {
  const activeChain = useActiveChain()
  const chains = useGetChains()

  if (chains[activeChain]?.comingSoonFeatures?.includes('activity')) {
    return <ComingSoon title='Activity' bottomNavLabel={BottomNavLabel.Activity} />
  }

  return <ActivityLandingPage />
}
