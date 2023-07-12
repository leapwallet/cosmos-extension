import { CosmosSDK } from '@leapwallet/cosmos-wallet-sdk';
import { QueryStatus, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import qs from 'qs';
import { useRef, useState } from 'react';

import { useActiveChain, useChainApis, useChainInfo, useSelectedNetwork, useSpamProposals } from '../store';
import { Proposal, Proposal2 } from '../types';
import { formatProposal } from './formatProposal';
import { govQueryIds } from './queryIds';

export function useGetProposals(paginationLimit = 30) {
  const activeChain = useActiveChain();
  const activeChainInfo = useChainInfo();
  const { lcdUrl } = useChainApis();
  const spamProposals = useSpamProposals();
  const [paginationKey, setPaginationKey] = useState<string | null>('');
  const paginationKeyRef = useRef(paginationKey);

  const filterSpamProposals = (proposalId: string) => {
    return spamProposals[activeChain] ? !spamProposals[activeChain].includes(Number(proposalId)) : true;
  };

  const queryData = useQuery({
    queryKey: [govQueryIds.proposals, activeChain, lcdUrl, paginationKey],
    queryFn: async (): Promise<Proposal[]> => {
      let url = `${lcdUrl}/cosmos/gov/v1beta1/proposals`;

      switch (activeChainInfo.cosmosSDK) {
        case CosmosSDK.Version_Point_46:
        case CosmosSDK.Version_Point_47:
          url = `${lcdUrl}/cosmos/gov/v1/proposals`;
          break;
      }

      const params = {
        'pagination.limit': paginationLimit,
        'pagination.reverse': true,
        'pagination.key': paginationKey,
      };
      const query = qs.stringify(params);
      const { data } = await axios.get(`${url}?${query}`);
      paginationKeyRef.current = data.pagination.next_key;

      let proposals = [];

      switch (activeChainInfo.cosmosSDK) {
        case CosmosSDK.Version_Point_46: {
          proposals = data.proposals
            .filter((proposal: { metadata: string }) => proposal.metadata)
            .filter((proposal: Proposal2.Proposal) => filterSpamProposals(proposal.id))
            .map((proposal: Proposal2.Proposal) => formatProposal(CosmosSDK.Version_Point_46, proposal));

          break;
        }

        case CosmosSDK.Version_Point_47: {
          proposals = data.proposals
            .filter((proposal: any) => filterSpamProposals(proposal.id))
            .map((proposal: any) => formatProposal(CosmosSDK.Version_Point_47, proposal));

          break;
        }

        default: {
          proposals = data.proposals
            .filter((p: { content: Proposal['content'] | undefined | null }) => p.content)
            .filter((proposal: any) => filterSpamProposals(proposal.proposal_id));

          break;
        }
      }

      return proposals.sort((a: any, b: any) => Number(b.proposal_id) - Number(a.proposal_id));
    },
    enabled: !!activeChain && paginationKey !== null,
    retry: 2,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    ...queryData,
    status: (() => {
      if (paginationKey === '') {
        return queryData.status;
      }
      if (queryData.isFetching) {
        return 'fetching-more';
      }
      return 'success';
    })() as QueryStatus | 'fetching-more',
    fetchMore: () => {
      if (!queryData.isFetching && paginationKeyRef.current !== null) {
        setPaginationKey(paginationKeyRef.current);
      }
    },
  };
}

export function useGetProposal(id: number, enabled: boolean) {
  const activeChain = useActiveChain();
  const selectedNetwork = useSelectedNetwork();
  const { lcdUrl, txUrl } = useChainApis();
  return useQuery(
    [govQueryIds.proposals, activeChain, selectedNetwork, id],
    async (): Promise<any> => {
      const url = `${lcdUrl}/cosmos/gov/v1beta1/proposals/${id}/tally`;
      const tallying = `${lcdUrl}/cosmos/gov/v1beta1/params/tallying`;
      const poolUrl = `${lcdUrl}/cosmos/staking/v1beta1/pool`;
      const proposerUrl = `${lcdUrl}/cosmos/gov/v1beta1/proposals/${id}/deposits`;
      const [data1, data2, data3, data4] = await Promise.all([
        axios.get(url),
        axios.get(tallying),
        axios.get(poolUrl),
        axios.get(proposerUrl),
      ]);
      const proposer = data4.data.deposits[data4.data.deposits.length - 1];
      return {
        ...data1.data.tally,
        ...data2.data.tally_params,
        ...data3.data.pool,
        proposer,
        proposerTxUrl: proposer?.depositor ? `${txUrl?.replace('txs', 'account')}/${proposer?.depositor}` : '',
      };
    },
    { enabled: !!activeChain && enabled, retry: 2 },
  );
}
