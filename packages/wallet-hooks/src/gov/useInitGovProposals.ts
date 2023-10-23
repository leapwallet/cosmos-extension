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
  const { setGovernanceData, setGovernanceStatus, setGovernanceFetchMore } = useGovProposalsStore();

  const filterSpamProposals = (proposal: any) => {
    if (spamProposals[activeChain] && spamProposals[activeChain].includes(Number(proposal.proposal_id))) {
      return false;
    }

    return !['airdrop', 'air drop', 'a i r d r o p'].some((text) =>
      (proposal.content.title ?? '').toLowerCase().trim().includes(text),
    );
  };

  const fetchGovProposals = async (paginationKey = '', previousData: Proposal[] = []) => {
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
            .map((proposal: Proposal2.Proposal) => formatProposal(CosmosSDK.Version_Point_46, proposal))
            .filter((proposal: Proposal2.Proposal) => filterSpamProposals(proposal));

          break;
        }

        case CosmosSDK.Version_Point_47: {
          proposals = data.proposals
            .map((proposal: any) => formatProposal(CosmosSDK.Version_Point_47, proposal))
            .filter((proposal: any) => filterSpamProposals(proposal));

          break;
        }

        default: {
          proposals = data.proposals
            .filter((p: { content: Proposal['content'] | undefined | null }) => p.content)
            .filter((proposal: any) => filterSpamProposals(proposal));

          break;
        }
      }

      setGovernanceData([
        ...previousData,
        ...proposals.sort((a: any, b: any) => Number(b.proposal_id) - Number(a.proposal_id)),
      ]);
      setGovernanceStatus('success');
    } catch (_) {
      setGovernanceData([]);
      setGovernanceStatus('error');
    }
  };

  useEffect(() => {
    if (lcdUrl && activeChain && selectedNetwork) {
      setTimeout(() => {
        setGovernanceStatus('loading');
        setGovernanceFetchMore(async () => {
          setGovernanceStatus('fetching-more');
          if (paginationKeyRef.current) {
            await fetchGovProposals(paginationKeyRef.current, useGovProposalsStore.getState().data);
          } else {
            setGovernanceStatus('success');
          }
        });
        paginationKeyRef.current = '';
        fetchGovProposals();
      }, 0);
    }
  }, [activeChain, lcdUrl, selectedNetwork]);
}
