/* eslint-disable @typescript-eslint/no-explicit-any */
import { useActiveChain, useIsFeatureExistForChain } from '@leapwallet/cosmos-wallet-hooks'
import { QueryStatus } from '@tanstack/react-query'
import { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { ComingSoon } from 'components/coming-soon'
import { PageName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { usePageView } from 'hooks/analytics/usePageView'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import { chainTagsStore } from 'stores/chain-infos-store'
import { governanceStore } from 'stores/governance-store'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'
import { AggregatedSupportedChain } from 'types/utility'

import {
  AggregatedGovernance,
  ProposalDetails,
  ProposalList,
  ProposalsProps,
  ProposalStatusEnum,
} from './components'
import { NtrnProposalDetails, NtrnProposalList, NtrnProposalStatus } from './neutron'

const GeneralProposals = observer(({ governanceStore, chainTagsStore }: ProposalsProps) => {
  const [selectedProposal, setSelectedProposal] = useState<string | undefined>()

  usePerformanceMonitor({
    page: 'governance',
    queryStatus: governanceStore.chainProposals.status as QueryStatus,
    op: 'governancePageLoad',
    description: 'loading state on governance page',
  })

  return selectedProposal === undefined ? (
    <ProposalList
      onClick={(id) => setSelectedProposal(id)}
      governanceStore={governanceStore}
      delegationsStore={delegationsStore}
      validatorsStore={validatorsStore}
      unDelegationsStore={unDelegationsStore}
      claimRewardsStore={claimRewardsStore}
      chainTagsStore={chainTagsStore}
    />
  ) : (
    <ProposalDetails
      governanceStore={governanceStore}
      selectedProp={selectedProposal}
      onBack={() => setSelectedProposal(undefined)}
    />
  )
})

const NeutronProposals = observer(({ governanceStore, chainTagsStore }: ProposalsProps) => {
  const [selectedProposal, setSelectedProposal] = useState<string | undefined>()

  const {
    data: proposalsList,
    status,
    shouldUseFallback: shouldPreferFallback,
    fetchMore,
  } = governanceStore.chainProposals

  usePerformanceMonitor({
    page: 'governance',
    queryStatus: status as QueryStatus,
    op: 'governancePageLoad',
    description: 'loading state on governance page',
  })

  const formatProposalStatus = (proposal: any): any => {
    let status = proposal?.status
    switch (proposal?.status) {
      case ProposalStatusEnum.PROPOSAL_STATUS_EXECUTED: {
        status = NtrnProposalStatus.EXECUTED
        break
      }
      case ProposalStatusEnum.PROPOSAL_STATUS_REJECTED: {
        status = NtrnProposalStatus.REJECTED
        break
      }
      case ProposalStatusEnum.PROPOSAL_STATUS_PASSED: {
        status = NtrnProposalStatus.PASSED
        break
      }
      case ProposalStatusEnum.PROPOSAL_STATUS_IN_PROGRESS:
      case ProposalStatusEnum.PROPOSAL_STATUS_VOTING_PERIOD: {
        status = NtrnProposalStatus.OPEN
        break
      }
    }
    return {
      ...proposal,
      status,
    }
  }

  const allProposals = useMemo(() => {
    if (shouldPreferFallback) {
      return proposalsList
    }
    return proposalsList?.map((proposal: any) => formatProposalStatus(proposal))
  }, [proposalsList, shouldPreferFallback])

  return selectedProposal === undefined ? (
    <NtrnProposalList
      proposalListStatus={status}
      proposalList={allProposals}
      shouldPreferFallback={shouldPreferFallback}
      onClick={(id) => setSelectedProposal(id)}
      chainTagsStore={chainTagsStore}
      fetchMore={fetchMore}
    />
  ) : (
    <NtrnProposalDetails
      selectedProp={selectedProposal}
      onBack={() => setSelectedProposal(undefined)}
      proposalList={allProposals}
      shouldUseFallback={shouldPreferFallback}
    />
  )
})

function Proposals() {
  usePageView(PageName.Governance)
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const isGovernanceComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'governance',
    platform: 'Extension',
  })

  useEffect(() => {
    governanceStore.initialize()
  }, [])

  if (activeChain === AGGREGATED_CHAIN_KEY) {
    return (
      <AggregatedGovernance governanceStore={governanceStore} chainTagsStore={chainTagsStore} />
    )
  }

  if (isGovernanceComingSoon) {
    return (
      <ComingSoon
        chainTagsStore={chainTagsStore}
        title='Governance'
        bottomNavLabel={BottomNavLabel.Governance}
      />
    )
  }

  return activeChain === 'neutron' ? (
    <NeutronProposals governanceStore={governanceStore} chainTagsStore={chainTagsStore} />
  ) : (
    <GeneralProposals governanceStore={governanceStore} chainTagsStore={chainTagsStore} />
  )
}

export default Proposals
