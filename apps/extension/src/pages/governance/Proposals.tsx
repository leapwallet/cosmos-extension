/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useActiveChain,
  useGetChains,
  useGetNtrnProposals,
  useGovProposals,
} from '@leapwallet/cosmos-wallet-hooks'
import { QueryStatus } from '@tanstack/react-query'
import { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { ComingSoon } from 'components/coming-soon'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import React, { useMemo, useState } from 'react'

import { NtrnProposalDetails, NtrnProposalList, NtrnProposalStatus } from './neutron'
import ProposalDetails from './ProposalDetails'
import ProposalList from './ProposalList'
import { ProposalStatus } from './Status'

function GeneralProposals() {
  usePageView(PageName.Governance)

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
      case ProposalStatus.PROPOSAL_STATUS_EXECUTED: {
        status = NtrnProposalStatus.EXECUTED
        break
      }
      case ProposalStatus.PROPOSAL_STATUS_REJECTED: {
        status = NtrnProposalStatus.REJECTED
        break
      }
      case ProposalStatus.PROPOSAL_STATUS_PASSED: {
        status = NtrnProposalStatus.PASSED
        break
      }
      case ProposalStatus.PROPOSAL_STATUS_IN_PROGRESS:
      case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD: {
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
  const activeChain = useActiveChain()
  const chains = useGetChains()

  if (chains[activeChain]?.comingSoonFeatures?.includes('governance')) {
    return <ComingSoon title='Governance' bottomNavLabel={BottomNavLabel.Governance} />
  }

  return activeChain === 'neutron' ? <NeutronProposals /> : <GeneralProposals />
}

export default Proposals
