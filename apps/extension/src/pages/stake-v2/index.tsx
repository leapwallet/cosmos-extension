import { useActiveChain, useIsFeatureExistForChain } from '@leapwallet/cosmos-wallet-hooks'
import { PageName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { usePageView } from 'hooks/analytics/usePageView'
import useQuery from 'hooks/useQuery'
import React, { useMemo } from 'react'
import { chainTagsStore } from 'stores/chain-infos-store'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import {
  aggregateStakeStore,
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'
import { AggregatedSupportedChain } from 'types/utility'

import { AggregatedStake } from './components/AggregatedStake'
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
    return (
      <AggregatedStake
        aggregateStakeStore={aggregateStakeStore}
        rootDenomsStore={rootDenomsStore}
        delegationsStore={delegationsStore}
        validatorsStore={validatorsStore}
        unDelegationsStore={unDelegationsStore}
        claimRewardsStore={claimRewardsStore}
        rootBalanceStore={rootBalanceStore}
        chainTagsStore={chainTagsStore}
      />
    )
  }

  if (isStakeNotSupported || isStakeComingSoon) {
    return (
      <StakingUnavailable
        chainTagsStore={chainTagsStore}
        isStakeComingSoon={isStakeComingSoon}
        isStakeNotSupported={isStakeNotSupported}
        rootDenomsStore={rootDenomsStore}
        delegationsStore={delegationsStore}
        validatorsStore={validatorsStore}
        unDelegationsStore={unDelegationsStore}
        claimRewardsStore={claimRewardsStore}
      />
    )
  }

  return (
    <>
      <StakePage
        rootDenomsStore={rootDenomsStore}
        delegationsStore={delegationsStore}
        validatorsStore={validatorsStore}
        unDelegationsStore={unDelegationsStore}
        claimRewardsStore={claimRewardsStore}
        rootBalanceStore={rootBalanceStore}
        chainTagsStore={chainTagsStore}
      />
    </>
  )
}
