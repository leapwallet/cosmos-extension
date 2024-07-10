export function proposalHasMetadataLink(proposal: any) {
  return proposal.metadata.startsWith('ipfs://') || proposal.metadata.startsWith('https://');
}
