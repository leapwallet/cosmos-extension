import { useActiveChain, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { ComingSoon } from 'components/coming-soon'
import { NoStake } from 'components/no-stake'
import React from 'react'

import StakePage from './Stake'

export default function Stake() {
  const activeChain = useActiveChain()
  const chains = useGetChains()

  if (chains[activeChain]?.comingSoonFeatures?.includes('stake')) {
    return <ComingSoon title='Staking' bottomNavLabel={BottomNavLabel.Stake} />
  }

  if (chains[activeChain]?.notSupportedFeatures?.includes('stake')) {
    return <NoStake />
  }

  return <StakePage />
}
