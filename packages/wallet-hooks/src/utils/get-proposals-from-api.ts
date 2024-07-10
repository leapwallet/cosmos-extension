import axios from 'axios';
import qs from 'qs';

import { ProposalApi } from '../types';
import { filterSpamProposals, getLeapapiBaseUrl } from './index';

export async function getProposalsFromApi(
  paginationLimit: number = 30,
  paginationKey: number = 0,
  previousData: ProposalApi[] = [],
  activeChainId: string,
  spamProposals: number[] = [],
) {
  const query = qs.stringify({
    timestamp: Date.now(),
    count: paginationLimit,
    offset: Number(paginationKey ?? 0),
  });

  const leapApiBaseUrl = getLeapapiBaseUrl();
  const { data } = await axios.post(`${leapApiBaseUrl}/gov/proposals/${activeChainId}?${query}`);

  const proposals = data?.proposals?.sort((a: any, b: any) => Number(b.proposal_id) - Number(a.proposal_id));
  const updatedProposals = [
    ...previousData,
    ...(proposals ?? [])
      .filter((proposal: any) => filterSpamProposals(proposal, spamProposals))
      .sort((a: any, b: any) => Number(b.proposal_id) - Number(a.proposal_id)),
  ];

  return {
    proposals: updatedProposals,
    key: data?.key,
  };
}
