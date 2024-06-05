import { getNeutronProposals } from '@leapwallet/cosmos-wallet-sdk';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import qs from 'qs';
import { useEffect, useMemo, useState } from 'react';
import { ProposalApi } from 'types';

import { useActiveChain, useChainApis, useGetChains, useSpamProposals } from '../store';
import { getLeapapiBaseUrl, getPlatformType } from '../utils';
import { useIsFeatureExistForChain } from '../utils-hooks';

export function useGetNtrnProposals() {
  const { rpcUrl, lcdUrl } = useChainApis();
  const activeChain = useActiveChain();
  const spamProposals = useSpamProposals();
  const chains = useGetChains();
  const [shouldPreferFallback, setShouldPreferFallback] = useState<boolean>(false);

  const isNeutronGovernanceComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'governance',
    platform: getPlatformType(),
    forceChain: 'neutron',
  });

  const isNeutronGovernanceNotSupported = useIsFeatureExistForChain({
    checkForExistenceType: 'notSupported',
    feature: 'governance',
    platform: getPlatformType(),
    forceChain: 'neutron',
  });

  const filterSpamProposals = (proposal: any) => {
    if (spamProposals.neutron && spamProposals.neutron.includes(Number(proposal?.proposal_id ?? proposal?.id))) {
      return false;
    }

    return !['airdrop', 'air drop', 'a i r d r o p'].some((text) =>
      (proposal?.title ?? proposal.proposal?.title ?? '').toLowerCase().trim().includes(text),
    );
  };

  const {
    data: proposalsData,
    status: proposalsStatus,
    isLoading: isLoadingProposals,
    fetchNextPage,
    hasNextPage,
    isFetching,
    fetchStatus,
  } = useInfiniteQuery(
    ['neutron-proposals', lcdUrl, chains],
    async ({ pageParam: paginationKey }): Promise<{ proposals: ProposalApi[]; key?: string }> => {
      const leapApiBaseUrl = getLeapapiBaseUrl();
      const query = qs.stringify({
        timestamp: Date.now(),

        count: 30,
        offset: Number(paginationKey ?? 0),
      });
      try {
        const { data } = await axios.post(`${leapApiBaseUrl}/gov/proposals/${chains.neutron.chainId}?${query}`, {
          lcdUrl,
          rpcUrl,
        });

        return {
          proposals: data?.proposals?.sort((a: any, b: any) => Number(b.proposal_id) - Number(a.proposal_id)),
          key: data?.key,
        };
      } catch (error) {
        console.log(error);
        return {
          proposals: [],
          key: undefined,
        };
      }
    },
    {
      enabled: !!lcdUrl && activeChain === 'neutron' && !shouldPreferFallback,
      getNextPageParam: (lastPage) => {
        return lastPage.key;
      },
    },
  );

  const allProposals = useMemo(
    () => proposalsData?.pages?.reduce((acc, page) => [...acc, ...(page?.proposals ?? [])], [] as ProposalApi[]),
    [proposalsData],
  );

  const filteredProposals = useMemo(
    () => allProposals?.filter((proposal) => filterSpamProposals(proposal)),
    [filterSpamProposals, allProposals],
  );

  useEffect(
    () =>
      setShouldPreferFallback(allProposals?.length === 0 && fetchStatus === 'idle' && proposalsStatus !== 'loading'),
    [fetchStatus, allProposals?.length, proposalsStatus],
  );

  const neutronProposalsQueryData = useQuery(
    ['fetch-neutron-proposals', rpcUrl, chains],
    async function () {
      if (isNeutronGovernanceComingSoon || isNeutronGovernanceNotSupported) {
        return;
      }

      const proposals = await getNeutronProposals(rpcUrl ?? '');
      return proposals.filter((proposal: any) => filterSpamProposals(proposal));
    },
    { enabled: !!rpcUrl && activeChain === 'neutron' && !!shouldPreferFallback },
  );

  useEffect(() => {
    if (hasNextPage && !isFetching && !shouldPreferFallback) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetching]);

  return {
    data: shouldPreferFallback ? neutronProposalsQueryData.data : filteredProposals,
    status: shouldPreferFallback ? neutronProposalsQueryData.status : proposalsStatus,
    isLoading: shouldPreferFallback ? neutronProposalsQueryData.isLoading : isLoadingProposals,
    shouldPreferFallback,
  };
}
