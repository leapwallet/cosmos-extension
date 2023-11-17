import { useGovProposals } from '@leapwallet/cosmos-wallet-hooks'
import { QueryStatus } from '@tanstack/react-query'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import { usePerformanceMonitor } from 'hooks/perf-monitoring/usePerformanceMonitor'
import React, { useState } from 'react'

import ProposalDetails from './ProposalDetails'
import ProposalList from './ProposalList'

function Proposals() {
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

export default Proposals
