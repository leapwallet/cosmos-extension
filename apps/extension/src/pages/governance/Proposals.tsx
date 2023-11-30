import {
  Proposal,
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
import React, { useEffect, useState } from 'react'

import { NtrnProposalDetails, NtrnProposalList } from './neutron'
import ProposalDetails from './ProposalDetails'
import ProposalList from './ProposalList'

function GeneralProposals() {
  usePageView(PageName.Governance)

  const [selectedProposal, setSelectedProposal] = useState<string | undefined>()
  const { data: proposalsList, status, fetchMore } = useGovProposals()

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
    />
  )
}

function NeutronProposals() {
  const [selectedProposal, setSelectedProposal] = useState<string | undefined>()
  const [allProposalsList, setAllProposalsList] = useState<Proposal[]>([])
  const { data: proposalsList, status } = useGetNtrnProposals()

  usePerformanceMonitor({
    page: 'governance',
    queryStatus: status as QueryStatus,
    op: 'governancePageLoad',
    description: 'loading state on governance page',
  })

  useEffect(() => {
    if (proposalsList) {
      setAllProposalsList((prev) =>
        [...prev, ...proposalsList].sort((a, b) => Number(b.proposal_id) - Number(a.proposal_id)),
      )
    }
  }, [proposalsList])

  return selectedProposal === undefined ? (
    <NtrnProposalList
      proposalListStatus={status}
      proposalList={allProposalsList}
      onClick={(id) => setSelectedProposal(id)}
    />
  ) : (
    <NtrnProposalDetails
      selectedProp={selectedProposal}
      onBack={() => setSelectedProposal(undefined)}
      proposalList={allProposalsList}
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
