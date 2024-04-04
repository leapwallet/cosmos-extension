import { axiosWrapper, CosmosSDK, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
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
import { Proposal, Proposal2, ProposalApi } from '../types';
import { formatProposal } from './formatProposal';
import { proposalHasContentMessages } from './utils';

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
  const paginationCountRef = useRef(0);
  const { shouldUseFallback, setShouldUseFallback, setGovernanceData, setGovernanceStatus, setGovernanceFetchMore } =
    useGovProposalsStore();

  const filterSpamProposals = (proposal: any) => {
    if (spamProposals[activeChain] && spamProposals[activeChain].includes(Number(proposal.proposal_id))) {
      return false;
    }

    return !['airdrop', 'air drop', 'a i r d r o p'].some((text) =>
      (proposal?.title ?? proposal.content?.title ?? '').toLowerCase().trim().includes(text),
    );
  };

  const fetchProposalsFromApi = async (paginationKey = 0, previousData: ProposalApi[] = []) => {
    try {
      const query = qs.stringify({
        timestamp: Date.now(),
        count: paginationLimit,
        offset: Number(paginationKey ?? 0),
      });

      const { data } = await axios.post(
        `${process.env.LEAP_WALLET_BACKEND_API_URL}/gov/proposals/${activeChainInfo.chainId}?${query}`,
      );
      paginationCountRef.current = data?.key;

      const proposals = data?.proposals?.sort((a: any, b: any) => Number(b.proposal_id) - Number(a.proposal_id));
      const updatedProposals = [
        ...previousData,
        ...(proposals ?? [])
          .filter((proposal: any) => filterSpamProposals(proposal))
          .sort((a: any, b: any) => Number(b.proposal_id) - Number(a.proposal_id)),
      ];
      if (updatedProposals?.length === 0) {
        throw new Error('No proposals found in API');
      }

      setGovernanceData(updatedProposals);
      setGovernanceStatus('success');
    } catch (error) {
      setGovernanceData([]);
      setGovernanceStatus('loading');
      setShouldUseFallback(true);
      console.log(error);
    }
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
          const proposalsWithMetadata = data.proposals.filter(
            (proposal: { metadata: string; messages?: any }) =>
              proposal.metadata || proposalHasContentMessages(proposal),
          );
          const formattedProposals = await Promise.all(
            proposalsWithMetadata.map(
              async (proposal: Proposal2.Proposal) => await formatProposal(CosmosSDK.Version_Point_46, proposal),
            ),
          );

          proposals = formattedProposals.filter((proposal: Proposal2.Proposal) => filterSpamProposals(proposal));
          break;
        }

        case CosmosSDK.Version_Point_47: {
          const formattedProposals = await Promise.all(
            data.proposals.map(async (proposal: any) => await formatProposal(CosmosSDK.Version_Point_47, proposal)),
          );

          proposals = formattedProposals.filter((proposal: any) => filterSpamProposals(proposal));
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
    if (shouldUseFallback) {
      setGovernanceFetchMore(async () => {
        setGovernanceStatus('fetching-more');
        if (paginationKeyRef.current) {
          await fetchGovProposals(paginationKeyRef.current, useGovProposalsStore.getState().data as Proposal[]);
        } else {
          setGovernanceStatus('success');
        }
      });
      paginationKeyRef.current = '';
      fetchGovProposals();
    }
  }, [shouldUseFallback]);

  useEffect(() => {
    setShouldUseFallback(false);
  }, [activeChain, selectedNetwork]);

  useEffect(() => {
    if (
      activeChainInfo?.comingSoonFeatures?.includes('governance') ||
      activeChainInfo?.notSupportedFeatures?.includes('governance')
    ) {
      setGovernanceStatus('success');
      setGovernanceData([]);
      return;
    }

    if (lcdUrl && activeChain && selectedNetwork) {
      setTimeout(() => {
        setGovernanceStatus('loading');
        setShouldUseFallback(false);
        setGovernanceFetchMore(async () => {
          setGovernanceStatus('fetching-more');
          if (paginationCountRef.current) {
            await fetchProposalsFromApi(
              paginationCountRef.current,
              useGovProposalsStore.getState().data as ProposalApi[],
            );
          } else {
            setGovernanceStatus('success');
          }
        });
        paginationCountRef.current = 0;
        fetchProposalsFromApi();
      }, 0);
    }
  }, [activeChain, lcdUrl, selectedNetwork, activeChainInfo]);
}
