import { useGovProposals } from '@leapwallet/cosmos-wallet-hooks'
import { QueryStatus } from '@tanstack/react-query'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import React, { useState } from 'react'

import ProposalDetails from './ProposalDetails'
import ProposalList from './ProposalList'

function Proposals() {
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

export default Proposals
