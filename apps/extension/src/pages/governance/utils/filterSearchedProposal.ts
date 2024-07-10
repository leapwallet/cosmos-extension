import { Proposal, ProposalApi } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'

export function filterSearchedProposal(
  proposal: Proposal | ProposalApi,
  searchedText: string,
  chains: Record<SupportedChain, { chainName: string }>,
) {
  if (!searchedText) {
    return true
  }

  const formattedSearchedText = searchedText.trim().toLowerCase()
  const chainName = proposal.chain ? chains[proposal.chain as SupportedChain].chainName : ''
  if (chainName.toLowerCase().includes(formattedSearchedText)) {
    return true
  }

  const proposalTitle =
    (proposal as ProposalApi)?.title ?? (proposal as Proposal)?.content?.title ?? ''
  if (proposalTitle.toLowerCase().includes(formattedSearchedText)) {
    return true
  }

  if (proposal.proposal_id.toString().includes(formattedSearchedText)) {
    return true
  }

  if (proposal.status.toLowerCase().includes(formattedSearchedText)) {
    return true
  }

  return false
}
