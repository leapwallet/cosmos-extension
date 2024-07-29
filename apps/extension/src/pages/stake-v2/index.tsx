import { useActiveChain, useIsFeatureExistForChain } from '@leapwallet/cosmos-wallet-hooks'
import { PageName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { usePageView } from 'hooks/analytics/usePageView'
import useQuery from 'hooks/useQuery'
import { AggregatedStake } from 'pages/stake/components'
import React, { useMemo } from 'react'
import { AggregatedSupportedChain } from 'types/utility'

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
  usePageView(PageName.Stake, true, pageViewAdditionalProperties)
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
