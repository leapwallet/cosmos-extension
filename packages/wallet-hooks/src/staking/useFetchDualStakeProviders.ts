import { ChainInfo, DenomsRecord, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect, useMemo } from 'react';

import { useActiveChain, useDualStakeProvidersStore, useGetChains, useSelectedNetwork } from '../store';
import { getPlatformType, getProviders, getStakingActiveChain, getStakingSelectedNetwork } from '../utils';
import { useIsFeatureExistForChain } from '../utils-hooks';

export function useFetchDualStakeProviders(denoms: DenomsRecord) {
  const { setStakeProviders, setStakeProvidersStatus, setStakeProvidersRefetch } = useDualStakeProvidersStore();

  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => {
    return getStakingActiveChain(_activeChain) as SupportedChain & 'aggregated';
  }, [_activeChain]);

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => {
    return getStakingSelectedNetwork(_activeChain, _selectedNetwork);
  }, [_selectedNetwork, _activeChain]);

  const isTestnet = useSelectedNetwork() === 'testnet';

  const chainInfos = useGetChains();
  const activeChainInfo: ChainInfo = chainInfos[activeChain];

  const isStakeComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'stake',
    platform: getPlatformType(),
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
  });

  const isStakeNotSupported = useIsFeatureExistForChain({
    checkForExistenceType: 'notSupported',
    feature: 'stake',
    platform: getPlatformType(),
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
  });

  useEffect(() => {
    let isCancelled = false;

    if (activeChain && activeChain === 'lava') {
      const fetchDualStakeProviders = async () => {
        try {
          if (isStakeComingSoon || isStakeNotSupported) {
            setTimeout(() => {
              setStakeProvidersStatus('success');
              setStakeProviders([]);
            }, 0);

            return;
          }

          if (isCancelled) return;
          const { providers } = await getProviders(selectedNetwork);
          setStakeProviders(providers);
          setStakeProvidersStatus('success');
        } catch (_) {
          if (isCancelled) return;
          setStakeProviders([]);
          setStakeProvidersStatus('error');
        }
      };

      if (activeChain && selectedNetwork && Object.keys(denoms).length) {
        setTimeout(() => {
          setStakeProvidersStatus('loading');
          setStakeProviders([]);
          setStakeProvidersRefetch(async function () {
            await fetchDualStakeProviders();
          });
          fetchDualStakeProviders();
        }, 0);
      } else {
        setStakeProvidersStatus('success');
        setStakeProviders([]);
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [
    denoms,
    activeChain,
    selectedNetwork,
    isTestnet,
    activeChainInfo,
    isStakeComingSoon,
    isStakeNotSupported,
    chainInfos,
  ]);
}
