import { DenomsRecord, fromSmall, getProviderRewards, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';
import { useEffect, useMemo } from 'react';

import { currencyDetail, useUserPreferredCurrency } from '../settings';
import { useDualStakeProviderRewardsStore } from '../store';
import { useActiveChain, useAddress, useDenoms, useGetChains, useSelectedNetwork } from '../store';
import {
  fetchCurrency,
  formatTokenAmount,
  getChainId,
  getPlatformType,
  getStakingActiveChain,
  getStakingSelectedNetwork,
  useActiveStakingDenom,
  useGetIbcDenomInfo,
} from '../utils';
import { useIsFeatureExistForChain } from '../utils-hooks';

export function useFetchDualStakeProviderRewards(denoms: DenomsRecord) {
  const { setClaimIsFetching, setClaimRefetch, setClaimRewards, setClaimStatus } = useDualStakeProviderRewardsStore();
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => {
    return getStakingActiveChain(_activeChain) as SupportedChain & 'aggregated';
  }, [_activeChain]);

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => {
    return getStakingSelectedNetwork(_activeChain, _selectedNetwork);
  }, [_selectedNetwork, _activeChain]);

  const address = useAddress(activeChain);
  const getIbcDenomInfo = useGetIbcDenomInfo(activeChain);
  const [preferredCurrency] = useUserPreferredCurrency();

  const chainInfos = useGetChains();
  const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, selectedNetwork);

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
      const fetchClaimRewards = async () => {
        try {
          if (isStakeComingSoon || isStakeNotSupported) {
            setTimeout(() => {
              setClaimStatus('success');
              setClaimRewards({});
            }, 0);

            return;
          }

          const response = await getProviderRewards(address);
          const { rewards } = response;
          const rewardItems = rewards.flatMap((reward) => reward.amount);

          const claimTotal = await Promise.all(
            rewardItems.map(async (claim) => {
              const { amount: _amount, denom } = claim;
              const { denomInfo } = await getIbcDenomInfo(denom);
              const amount = fromSmall(_amount, denomInfo?.coinDecimals ?? 6);

              let denomFiatValue = '0';
              if (denomInfo) {
                const denomChainInfo = chainInfos?.[denomInfo.chain as SupportedChain];
                const _chainId = getChainId(denomChainInfo, selectedNetwork);

                denomFiatValue =
                  (await fetchCurrency(
                    '1',
                    denomInfo.coinGeckoId,
                    denomInfo.chain as SupportedChain,
                    currencyDetail[preferredCurrency].currencyPointer,
                    `${_chainId}-${denomInfo.coinMinimalDenom}`,
                  )) ?? '0';
              }

              const currencyAmount = new BigNumber(amount).multipliedBy(denomFiatValue).toString();

              let formatted_amount = '';
              if (denomInfo) {
                formatted_amount = formatTokenAmount(amount, denomInfo.coinDenom, denomInfo.coinDecimals);

                if (formatted_amount === 'NaN') {
                  formatted_amount = '0 ' + denomInfo.coinDenom;
                }
              }

              return {
                ...claim,
                amount,
                currencyAmount,
                formatted_amount,
                tokenInfo: denomInfo,
                denomFiatValue,
              };
            }),
          );

          let totalRewardsDollarAmt = '0';
          if (claimTotal[0]) {
            totalRewardsDollarAmt = claimTotal
              .reduce((totalSum, token) => {
                return totalSum.plus(new BigNumber(token.currencyAmount ?? ''));
              }, new BigNumber('0'))
              .toString();
          }
          const totalRewards = claimTotal
            .reduce((a, v) => {
              return a + +v.amount;
            }, 0)
            .toString();
          let formattedTotalRewards = formatTokenAmount(totalRewards, activeStakingDenom.coinDenom, 4);
          if (formattedTotalRewards === 'NaN') {
            formattedTotalRewards = '0 ' + activeStakingDenom.coinDenom;
          }
          setClaimRewards({
            rewards,
            totalRewards,
            formattedTotalRewards,
            totalRewardsDollarAmt,
          });
          setClaimStatus('success');
        } catch (_) {
          if (isCancelled) return;

          setClaimRewards({});
          setClaimStatus('error');
        }
      };

      if (address && activeChain && selectedNetwork && Object.keys(denoms).length) {
        setTimeout(() => {
          setClaimStatus('loading');
          setClaimRewards({});
          setClaimRefetch(async function () {
            setClaimIsFetching(true);
            await fetchClaimRewards();
            setClaimIsFetching(false);
          });
          fetchClaimRewards();
        }, 0);
      } else {
        setClaimStatus('success');
        setClaimRewards({});
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [
    address,
    chainInfos,
    preferredCurrency,
    activeStakingDenom,
    denoms,
    activeChain,
    selectedNetwork,
    isStakeComingSoon,
    isStakeNotSupported,
  ]);
}
