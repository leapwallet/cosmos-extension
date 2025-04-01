import { Proposal, ProposalApi } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import React from 'react'

import { NtrnProposalDetails } from '../neutron'
import { ProposalDetails } from './index'

export default function GenericProposalDetails({
  selectedProposalChain,
  selectedProposalId,
  handleProposalDetailsBack,
  allProposals,
  shouldUseFallback,
  forceNetwork,
}: {
  selectedProposalChain: SupportedChain
  selectedProposalId: string
  handleProposalDetailsBack: () => void
  allProposals: (Proposal | ProposalApi)[]
  shouldUseFallback: boolean
  forceNetwork: 'mainnet' | 'testnet'
}) {
  if (selectedProposalChain === 'neutron') {
    return (
      <NtrnProposalDetails
        selectedProp={selectedProposalId}
        onBack={handleProposalDetailsBack}
        proposalList={allProposals}
        shouldUseFallback={shouldUseFallback}
        forceChain={selectedProposalChain}
        forceNetwork={forceNetwork}
      />
    )
  }

  return (
    <ProposalDetails
      selectedProp={selectedProposalId}
      onBack={handleProposalDetailsBack}
      forceChain={selectedProposalChain}
      forceNetwork={forceNetwork}
      governanceStore={{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        chainProposals: {
          data: allProposals as ProposalApi[] | Proposal[],
          shouldUseFallback,
        },
      }}
    />
  )
}
