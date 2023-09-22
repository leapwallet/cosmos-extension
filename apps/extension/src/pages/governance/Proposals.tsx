import { Proposal, useGovProposals } from '@leapwallet/cosmos-wallet-hooks'
import { QueryStatus } from '@tanstack/react-query'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import React, { useEffect, useState } from 'react'

import ProposalDetails from './ProposalDetails'
import ProposalList from './ProposalList'

function Proposals() {
  const [selectedProposal, setSelectedProposal] = useState<string | undefined>()
  const [allProposalsList, setAllProposalsList] = useState<Proposal[]>([])
  const { data: proposalsList, status, fetchMore } = useGovProposals()

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
    <ProposalList
      proposalListStatus={status}
      proposalList={allProposalsList}
      onClick={(id) => setSelectedProposal(id)}
      fetchMore={fetchMore}
    />
  ) : (
    <ProposalDetails
      selectedProp={selectedProposal}
      onBack={() => setSelectedProposal(undefined)}
      proposalList={allProposalsList}
    />
  )
}

export default Proposals
