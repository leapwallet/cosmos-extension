import { axiosWrapper, CosmosSDK } from '@leapwallet/cosmos-wallet-sdk';
import qs from 'qs';

import { Proposal, Proposal2 } from '../types';
import { filterSpamProposals, formatProposal, proposalHasContentMessages } from './index';

export async function getProposalsFromNodes(
  paginationLimit: number = 30,
  paginationKey: string = '',
  previousData: Proposal[] = [],
  lcdUrl: string,
  spamProposals: number[] = [],
  activeChainCosmosSDK?: CosmosSDK,
) {
  let url = `/cosmos/gov/v1beta1/proposals`;

  switch (activeChainCosmosSDK) {
    case CosmosSDK.Version_Point_46:
    case CosmosSDK.Version_Point_47:
      url = `/cosmos/gov/v1/proposals`;
      break;
  }

  const params = {
    'pagination.limit': paginationLimit,
    'pagination.reverse': true,
    'pagination.key': paginationKey,
  };
  const query = qs.stringify(params);

  const { data } = await axiosWrapper({
    baseURL: lcdUrl,
    method: 'get',
    url: `${url}?${query}`,
  });

  let proposals = [];
  switch (activeChainCosmosSDK) {
    case CosmosSDK.Version_Point_46: {
      const proposalsWithMetadata = data.proposals.filter(
        (proposal: { metadata: string; messages?: any }) => proposal.metadata || proposalHasContentMessages(proposal),
      );
      const formattedProposals = await Promise.all(
        proposalsWithMetadata.map(
          async (proposal: Proposal2.Proposal) => await formatProposal(CosmosSDK.Version_Point_46, proposal),
        ),
      );

      proposals = formattedProposals.filter((proposal: Proposal2.Proposal) =>
        filterSpamProposals(proposal, spamProposals),
      );
      break;
    }

    case CosmosSDK.Version_Point_47: {
      const formattedProposals = await Promise.all(
        data.proposals.map(async (proposal: any) => await formatProposal(CosmosSDK.Version_Point_47, proposal)),
      );

      proposals = formattedProposals.filter((proposal: any) => filterSpamProposals(proposal, spamProposals));
      break;
    }

    default: {
      proposals = data.proposals
        .filter((p: { content: Proposal['content'] | undefined | null }) => p.content)
        .filter((proposal: any) => filterSpamProposals(proposal, spamProposals));

      break;
    }
  }

  return {
    proposals: [...previousData, ...proposals.sort((a: any, b: any) => Number(b.proposal_id) - Number(a.proposal_id))],
    key: data.pagination.next_key,
  };
}
