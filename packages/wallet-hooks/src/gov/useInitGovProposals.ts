import { axiosWrapper, CosmosSDK, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import qs from 'qs';
import { useEffect, useRef } from 'react';

import {
  useActiveChain,
  useChainApis,
  useChainInfo,
  useGovProposalsStore,
  useSelectedNetwork,
  useSpamProposals,
} from '../store';
import { Proposal, Proposal2 } from '../types';
import { formatProposal } from './formatProposal';

export function useInitGovProposals(
  paginationLimit = 30,
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
) {
  const _activeChain = useActiveChain();
  const activeChain = forceChain ?? _activeChain;

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const activeChainInfo = useChainInfo();
  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);
  const spamProposals = useSpamProposals();
  const paginationKeyRef = useRef('');
  const { setGovernanceData, setGovernanceStatus } = useGovProposalsStore();

  const filterSpamProposals = (proposalId: string) => {
    return spamProposals[activeChain] ? !spamProposals[activeChain].includes(Number(proposalId)) : true;
  };

  const fetchGovProposals = async (paginationKey = '') => {
    try {
      let url = `/cosmos/gov/v1beta1/proposals`;

      switch (activeChainInfo.cosmosSDK) {
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

      setGovernanceData(
        proposals.sort((a: any, b: any) => Number(b.proposal_id) - Number(a.proposal_id)),
        async () => {
          setGovernanceStatus('fetching-more');
          await fetchGovProposals(paginationKeyRef.current);
        },
      );

      setGovernanceStatus('success');
    } catch (_) {
      setGovernanceData([], async () => {
        setGovernanceStatus('fetching-more');
        await fetchGovProposals(paginationKeyRef.current);
      });

      setGovernanceStatus('error');
    }
  };

  useEffect(() => {
    if (lcdUrl && activeChain && selectedNetwork) {
      setTimeout(() => {
        setGovernanceStatus('loading');
        fetchGovProposals();
      }, 0);
    }
  }, [activeChain, lcdUrl, selectedNetwork]);
}
