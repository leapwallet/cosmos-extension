import React, { useEffect, useState } from 'react'

import ProposalDetails from './widgets/proposal-details'
import ProposalList from './widgets/proposal-list'

function Proposals() {
  const [selectedProposal, setSelectedProposal] = useState<string>()
  const [proposalsList, setProposalsList] = useState<{
    status: 'loading' | 'success' | 'error'
    data: any[]
  }>({ status: 'loading', data: [] })

  useEffect(() => {
    import('./data')
      .then((m) => setProposalsList({ status: 'success', data: m.default }))
      .catch(() => setProposalsList({ status: 'error', data: [] }))
  }, [])

  return selectedProposal === undefined ? (
    <ProposalList
      proposalListStatus={proposalsList.status}
      proposalList={proposalsList.data}
      onClick={(id) => setSelectedProposal(id)}
    />
  ) : (
    <ProposalDetails
      selectedProp={selectedProposal}
      onBack={() => setSelectedProposal(undefined)}
      proposalList={proposalsList.data}
    />
  )
}

export default Proposals
