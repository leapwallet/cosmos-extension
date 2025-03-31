import { Proposal, ProposalApi } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'

type GovProposal = Proposal | ProposalApi

export function sortProposal(
  itemA: GovProposal,
  itemB: GovProposal,
  chains: Record<SupportedChain, { chainName: string }>,
) {
  const chainA = (itemA.chain ?? 'cosmos') as SupportedChain
  const chainB = (itemB.chain ?? 'cosmos') as SupportedChain

  const chainNameA = chains[chainA].chainName
  const chainNameB = chains[chainB].chainName

  return chainNameA.localeCompare(chainNameB)
}
