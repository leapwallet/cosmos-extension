import { useIsFeatureExistForChain } from '@leapwallet/cosmos-wallet-hooks'
import React from 'react'

import StakingUnavailable from './components/StakingUnavailable'
import StakePage from './StakePage'

export default function Stake() {
  const isStakeNotSupported = useIsFeatureExistForChain({
    checkForExistenceType: 'notSupported',
    feature: 'stake',
    platform: 'Extension',
  })

  if (isStakeNotSupported) {
    return <StakingUnavailable isStakeNotSupported={isStakeNotSupported} />
  }

  return <StakePage />
}
