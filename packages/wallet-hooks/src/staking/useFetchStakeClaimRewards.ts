import { DenomsRecord, fromSmall, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';
import { useEffect, useMemo } from 'react';

import { useUserPreferredCurrency } from '../settings';
import {
  useActiveChain,
  useAddress,
  useChainApis,
  useGetChains,
  useSelectedNetwork,
  useStakeClaimRewardsStore,
} from '../store';
import {
  formatTokenAmount,
  getClaimRewardsForChain,
  getPlatformType,
  getStakingActiveChain,
  getStakingSelectedNetwork,
  useActiveStakingDenom,
  useGetIbcDenomInfo,
} from '../utils';
import { useIsFeatureExistForChain } from '../utils-hooks';

export function useFetchStakeClaimRewards(
  denoms: DenomsRecord,
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
) {
  const { setClaimRewards, setClaimStatus, setClaimIsFetching, setClaimRefetch, pushForceChain, pushForceNetwork } =
    useStakeClaimRewardsStore();

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
  const getIbcDenomInfo = useGetIbcDenomInfo(denoms, activeChain);
  const [preferredCurrency] = useUserPreferredCurrency();

  const chainInfos = useGetChains();
  const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, selectedNetwork);
  const activeChainInfo = chainInfos[activeChain];

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
      const fetchClaimRewards = async () => {
        try {
          if (isStakeComingSoon || isStakeNotSupported) {
            setTimeout(() => {
              setClaimStatus('success');
              setClaimRewards({});
            }, 0);

            return;
          }

          const response = await getClaimRewardsForChain({
            lcdUrl: lcdUrl ?? '',
            address,
            isCancelled,
            selectedNetwork,
            preferredCurrency,
            chainInfos,
            getIbcDenomInfo,
            activeStakingDenom,
          });

          if (isCancelled || response === undefined) return;
          const { claimTotal, totalRewardsDollarAmt, _rewards } = response;
          const rewards = _rewards.reduce((a: any, v: any) => ({ ...a, [v.validator_address]: v }), {});

          const totalRewards = await Promise.all(
            _rewards.map(async (_reward) => {
              const reward = await Promise.all(
                _reward?.reward.map(async (claim) => {
                  const { amount: _amount, denom } = claim;
                  const denomInfo = claimTotal.find((token) => token.denom === denom);
                  const amount = fromSmall(_amount, denomInfo?.tokenInfo?.coinDecimals ?? 6);

                  const denomFiatValue = denomInfo?.denomFiatValue ?? '0';
                  const currencyAmount = new BigNumber(amount).multipliedBy(denomFiatValue).toString();

                  let formatted_amount = '';
                  if (denomInfo && denomInfo.tokenInfo) {
                    const tokenInfo = denomInfo.tokenInfo;
                    formatted_amount = formatTokenAmount(amount, tokenInfo.coinDenom, tokenInfo.coinDecimals);

                    if (formatted_amount === 'NaN') {
                      formatted_amount = '0 ' + tokenInfo.coinDenom;
                    }
                  }

                  return {
                    ...claim,
                    amount,
                    currencyAmount,
                    formatted_amount,
                    tokenInfo: denomInfo?.tokenInfo,
                  };
                }),
              );

              return {
                ..._reward,
                reward,
              };
            }),
          );

          if (isCancelled) return;
          const totalRewardsAmt = claimTotal
            .reduce((a, v) => {
              return a + +v.amount;
            }, 0)
            .toString();

          let formattedTotalRewardsAmt = formatTokenAmount(totalRewardsAmt, activeStakingDenom.coinDenom, 4);
          if (formattedTotalRewardsAmt === 'NaN') {
            formattedTotalRewardsAmt = '0 ' + activeStakingDenom.coinDenom;
          }

          if (isCancelled) return;
          setClaimRewards({
            rewards,
            result: { rewards: totalRewards, total: claimTotal },
            totalRewards: totalRewardsAmt,
            formattedTotalRewards: formattedTotalRewardsAmt,
            totalRewardsDollarAmt,
          });
          setClaimStatus('success');
        } catch (_) {
          if (isCancelled) return;

          setClaimRewards({});
          setClaimStatus('error');
        }
      };

      if (lcdUrl && address && activeChain && selectedNetwork && Object.keys(denoms).length) {
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
    lcdUrl,
    address,
    chainInfos,
    preferredCurrency,
    activeStakingDenom,
    denoms,
    activeChain,
    selectedNetwork,
    activeChainInfo,
    isStakeComingSoon,
    isStakeNotSupported,
  ]);
}
