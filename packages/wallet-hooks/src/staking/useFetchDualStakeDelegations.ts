import { DenomsRecord, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect, useMemo } from 'react';

import { useUserPreferredCurrency } from '../settings';
import { useActiveChain, useAddress, useChainApis, useDualStakeDelegationsStore, useSelectedNetwork } from '../store';
import {
  getPlatformType,
  getProviderDelegations,
  getStakingActiveChain,
  getStakingSelectedNetwork,
  useActiveStakingDenom,
} from '../utils';
import { useChainId, useIsFeatureExistForChain } from '../utils-hooks';

export function useFetchDualStakeDelegations(denoms: DenomsRecord) {
  const { setDualStakeDelegationInfo, setDualStakeDelegationLoading, setDualStakeDelegationRefetch } =
    useDualStakeDelegationsStore();

  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => {
    return getStakingActiveChain(_activeChain) as SupportedChain & 'aggregated';
  }, [_activeChain]);

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => {
    return getStakingSelectedNetwork(_activeChain, _selectedNetwork);
  }, [_selectedNetwork, _activeChain]);

  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);
  const address = useAddress(activeChain);
  const [preferredCurrency] = useUserPreferredCurrency();

  const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, selectedNetwork);
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
    if (activeChain && activeChain === 'lava') {
      const fetchDualStakeDelegations = async () => {
        try {
          if (isStakeComingSoon || isStakeNotSupported) {
            setTimeout(() => {
              setDualStakeDelegationLoading(false);
              setDualStakeDelegationInfo({});
            }, 0);

            return;
          }

          const response = await getProviderDelegations({
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
          setDualStakeDelegationInfo({
            delegations,
            totalDelegationAmount,
            currencyAmountDelegation,
            totalDelegation,
          });
        } catch (_) {
          if (isCancelled) return;
          setDualStakeDelegationInfo({});
        } finally {
          setDualStakeDelegationLoading(false);
        }
      };

      if (lcdUrl && address && activeChain && selectedNetwork && Object.keys(denoms).length) {
        setTimeout(() => {
          setDualStakeDelegationLoading(true);
          setDualStakeDelegationInfo({});
          setDualStakeDelegationRefetch(async function () {
            await fetchDualStakeDelegations();
          });
          fetchDualStakeDelegations();
        }, 0);
      } else {
        setDualStakeDelegationLoading(false);
        setDualStakeDelegationInfo({});
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [
    lcdUrl,
    denoms,
    address,
    activeStakingDenom,
    preferredCurrency,
    activeChain,
    selectedNetwork,
    isStakeComingSoon,
    isStakeNotSupported,
  ]);
}
