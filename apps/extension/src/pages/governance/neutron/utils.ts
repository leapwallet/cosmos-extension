/* eslint-disable @typescript-eslint/no-explicit-any */
export const getTitle = (proposal: any, shouldPreferFallback: boolean) => {
  if (shouldPreferFallback === true) {
    return proposal?.proposal?.title
  }
  return proposal?.title
}

export const getStatus = (proposal: any, shouldPreferFallback: boolean) => {
  if (shouldPreferFallback === true) {
    return proposal?.proposal?.status
  }
  return proposal?.status
}

export const getId = (proposal: any, shouldPreferFallback: boolean) => {
  if (shouldPreferFallback === true) {
    return proposal?.id
  }
  return proposal?.proposal_id
}

export const getTurnout = (proposal: any, totalVotes: any, shouldUseFallback: boolean) => {
  return shouldUseFallback === true
    ? (totalVotes / proposal?.proposal?.total_power ?? 1) * 100
    : proposal?.turnout
}

export const getQuorum = (proposal: any, shouldUseFallback: boolean) => {
  return shouldUseFallback === true
    ? proposal?.proposal?.threshold?.threshold_quorum?.quorum?.percent * 100
    : proposal?.quorum
}

export const getDescription = (proposal: any, shouldPreferFallback: boolean) => {
  if (shouldPreferFallback === true) {
    return proposal?.proposal?.description
  }
  return proposal?.description
}

export const getEndTime = (proposal: any, shouldPreferFallback: boolean) => {
  if (shouldPreferFallback === true) {
    return Math.ceil(proposal?.proposal?.expiration?.at_time / 10 ** 6)
  }
  return proposal?.voting_end_time
}

export const getVotes = (proposal: any, shouldPreferFallback: boolean) => {
  if (shouldPreferFallback === true) {
    return proposal?.proposal?.votes
  }
  return proposal?.tally
}

export const getProposer = (proposal: any, shouldPreferFallback: boolean) => {
  if (shouldPreferFallback === true) {
    return proposal?.proposal?.proposer
  }
  return proposal?.proposer?.address
}
