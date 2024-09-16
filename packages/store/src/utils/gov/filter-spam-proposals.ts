export function filterSpamProposals(proposal: any, spamProposals: number[]) {
  if (spamProposals && spamProposals.includes(Number(proposal?.proposal_id ?? proposal?.id))) {
    return false;
  }

  return !['airdrop', 'air drop', 'a i r d r o p'].some((text) =>
    (proposal?.title ?? proposal.content?.title ?? proposal.proposal?.title ?? '').toLowerCase().trim().includes(text),
  );
}
