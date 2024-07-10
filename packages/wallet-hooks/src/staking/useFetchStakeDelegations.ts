import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect, useMemo } from 'react';

import { useUserPreferredCurrency } from '../settings';
import {
  useActiveChain,
  useAddress,
  useChainApis,
  useDenoms,
  useGetChains,
  useSelectedNetwork,
  useStakeDelegationsStore,
} from '../store';
import {
  getDelegationsForChain,
  getPlatformType,
  getStakingActiveChain,
  getStakingSelectedNetwork,
  useActiveStakingDenom,
} from '../utils';
import { useChainId, useIsFeatureExistForChain } from '../utils-hooks';

export function useFetchStakeDelegations(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const {
    setStakeDelegationInfo,
    setStakeDelegationLoading,
    setStakeDelegationRefetch,
    pushForceChain,
    pushForceNetwork,
  } = useStakeDelegationsStore();

  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => {
    return getStakingActiveChain(_activeChain, pushForceChain, forceChain) as SupportedChain & 'aggregated';
  }, [pushForceChain, forceChain, _activeChain]);

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => {
    return getStakingSelectedNetwork(_activeChain, _selectedNetwork, pushForceNetwork, forceNetwork);
  }, [pushForceNetwork, forceNetwork, _selectedNetwork, _activeChain]);

  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);
  const address = useAddress(activeChain);
  const [preferredCurrency] = useUserPreferredCurrency();

  const denoms = useDenoms();
  const chainInfos = useGetChains();
  const [activeStakingDenom] = useActiveStakingDenom(activeChain, selectedNetwork);
  const activeChainInfo = chainInfos[activeChain];
  const chainId = useChainId(activeChain, selectedNetwork);

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

    if (activeChain && activeChain !== 'aggregated') {
      const fetchStakeDelegations = async () => {
        try {
          if (isStakeComingSoon || isStakeNotSupported) {
            setTimeout(() => {
              setStakeDelegationLoading(false);
              setStakeDelegationInfo({});
            }, 0);

            return;
          }

          const response = await getDelegationsForChain({
            lcdUrl: lcdUrl ?? '',
            address,
            isCancelled,
            activeStakingDenom,
            chainId: chainId ?? '',
            preferredCurrency,
            activeChain,
          });

          if (isCancelled || response === undefined) {
            return;
          }

          const { delegations, totalDelegationAmount, currencyAmountDelegation, totalDelegation } = response;

          setStakeDelegationInfo({
            delegations,
            totalDelegationAmount,
            currencyAmountDelegation,
            totalDelegation,
          });
        } catch (_) {
          if (isCancelled) return;
          setStakeDelegationInfo({});
        } finally {
          setStakeDelegationLoading(false);
        }
      };

      if (lcdUrl && address && activeChain && selectedNetwork && Object.keys(denoms).length) {
        setTimeout(() => {
          setStakeDelegationLoading(true);
          setStakeDelegationInfo({});
          setStakeDelegationRefetch(async function () {
            await fetchStakeDelegations();
          });
          fetchStakeDelegations();
        }, 0);
      } else {
        setStakeDelegationLoading(false);
        setStakeDelegationInfo({});
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [
    lcdUrl,
    address,
    activeStakingDenom,
    preferredCurrency,
    denoms,
    activeChain,
    selectedNetwork,
    activeChainInfo,
    isStakeComingSoon,
    isStakeNotSupported,
  ]);
}
