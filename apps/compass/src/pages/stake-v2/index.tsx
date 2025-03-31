import { useIsFeatureExistForChain } from '@leapwallet/cosmos-wallet-hooks'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import useQuery from 'hooks/useQuery'
import React, { useMemo } from 'react'

import StakingUnavailable from './components/StakingUnavailable'
import StakePage from './StakePage'

export default function Stake() {
  const pageViewSource = useQuery().get('pageSource') ?? undefined
  const pageViewAdditionalProperties = useMemo(
    () => ({
      pageViewSource,
    }),
    [pageViewSource],
  )
  usePageView(PageName.Stake, pageViewAdditionalProperties)

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

  if (isStakeNotSupported || isStakeComingSoon) {
    return (
      <StakingUnavailable
        isStakeComingSoon={isStakeComingSoon}
        isStakeNotSupported={isStakeNotSupported}
      />
    )
  }

  return <StakePage />
}
