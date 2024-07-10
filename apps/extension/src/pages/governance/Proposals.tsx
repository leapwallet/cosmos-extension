/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useActiveChain,
  useGetNtrnProposals,
  useGovProposals,
  useIsFeatureExistForChain,
} from '@leapwallet/cosmos-wallet-hooks'
import { QueryStatus } from '@tanstack/react-query'
import { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { ComingSoon } from 'components/coming-soon'
import { PageName } from 'config/analytics'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { usePageView } from 'hooks/analytics/usePageView'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import React, { useMemo, useState } from 'react'
import { AggregatedSupportedChain } from 'types/utility'

import { AggregatedGovernance, ProposalDetails, ProposalStatusEnum } from './components'
import { NtrnProposalDetails, NtrnProposalList, NtrnProposalStatus } from './neutron'
import ProposalList from './ProposalList'

function GeneralProposals() {
  const [selectedProposal, setSelectedProposal] = useState<string | undefined>()
  const { data: proposalsList, status, fetchMore, shouldUseFallback } = useGovProposals()

  usePerformanceMonitor({
    page: 'governance',
    queryStatus: status as QueryStatus,
    op: 'governancePageLoad',
    description: 'loading state on governance page',
  })

  return selectedProposal === undefined ? (
    <ProposalList
      proposalListStatus={status}
      proposalList={proposalsList}
      onClick={(id) => setSelectedProposal(id)}
      fetchMore={fetchMore}
    />
  ) : (
    <ProposalDetails
      selectedProp={selectedProposal}
      onBack={() => setSelectedProposal(undefined)}
      proposalList={proposalsList}
      shouldUseFallback={shouldUseFallback}
    />
  )
}

function NeutronProposals() {
  const [selectedProposal, setSelectedProposal] = useState<string | undefined>()
  const { data: proposalsList, status, shouldPreferFallback } = useGetNtrnProposals()

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
    />
  ) : (
    <NtrnProposalDetails
      selectedProp={selectedProposal}
      onBack={() => setSelectedProposal(undefined)}
      proposalList={allProposals}
      shouldUseFallback={shouldPreferFallback}
    />
  )
}

function Proposals() {
  usePageView(PageName.Governance)
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const isGovernanceComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'governance',
    platform: 'Extension',
  })

  if (activeChain === AGGREGATED_CHAIN_KEY) {
    return <AggregatedGovernance />
  }

  if (isGovernanceComingSoon) {
    return <ComingSoon title='Governance' bottomNavLabel={BottomNavLabel.Governance} />
  }

  return activeChain === 'neutron' ? <NeutronProposals /> : <GeneralProposals />
}

export default Proposals
