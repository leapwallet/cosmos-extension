import { CosmosSDK, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect, useMemo, useRef } from 'react';

import {
  useActiveChain,
  useChainApis,
  useChainCosmosSDK,
  useGovProposalsStore,
  useSelectedNetwork,
  useSpamProposals,
} from '../store';
import { Proposal, ProposalApi } from '../types';
import { getPlatformType, getProposalsFromApi, getProposalsFromNodes } from '../utils';
import { useChainInfo, useIsFeatureExistForChain } from '../utils-hooks';

export function useInitGovProposals(
  paginationLimit = 30,
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
) {
  const _activeChain = useActiveChain();
  const activeChain = useMemo(
    () => (forceChain || _activeChain) as SupportedChain & 'aggregated',
    [forceChain, _activeChain],
  );

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(
    () => (forceNetwork || _selectedNetwork) as SupportedChain & 'aggregated',
    [forceNetwork, _selectedNetwork],
  );

  const activeChainInfo = useChainInfo();
  const activeChainCosmosSDK = useChainCosmosSDK(activeChain);
  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);
  const spamProposals = useSpamProposals();
  const paginationKeyRef = useRef('');
  const paginationCountRef = useRef(0);
  const { shouldUseFallback, setShouldUseFallback, setGovernanceData, setGovernanceStatus, setGovernanceFetchMore } =
    useGovProposalsStore();

  const isGovernanceComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'governance',
    platform: getPlatformType(),
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
  });

  const isGovernanceNotSupported = useIsFeatureExistForChain({
    checkForExistenceType: 'notSupported',
    feature: 'governance',
    platform: getPlatformType(),
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
  });

  const fetchProposalsFromApi = async (paginationKey = 0, previousData: ProposalApi[] = []) => {
    try {
      const { proposals: updatedProposals, key } = await getProposalsFromApi(
        paginationLimit,
        paginationKey,
        previousData,
        activeChainInfo.chainId,
        spamProposals[activeChain],
      );

      paginationCountRef.current = key;
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
      const { proposals, key } = await getProposalsFromNodes(
        paginationLimit,
        paginationKey,
        previousData,
        lcdUrl ?? '',
        spamProposals[activeChain],
        activeChainCosmosSDK as CosmosSDK,
      );

      paginationKeyRef.current = key;
      setGovernanceData(proposals);
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
    if (activeChain && activeChain !== 'aggregated') {
      setShouldUseFallback(false);
    }
  }, [activeChain, selectedNetwork]);

  useEffect(() => {
    if (activeChain && activeChain !== 'aggregated') {
      if (isGovernanceComingSoon || isGovernanceNotSupported) {
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
    }
  }, [activeChain, lcdUrl, selectedNetwork, activeChainInfo]);
}
