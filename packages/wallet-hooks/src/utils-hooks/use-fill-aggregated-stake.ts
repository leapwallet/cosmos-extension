import { DenomsRecord, getChainInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';

import { useUserPreferredCurrency } from '../settings';
import { AggregatedStake, useAddress, useChainApis, useGetChains } from '../store';
import {
  getChainsApr,
  getClaimRewardsForChain,
  getDelegationsForChain,
  getPlatformType,
  useActiveStakingDenom,
  useGetIbcDenomInfo,
} from '../utils';
import { useChainId, useIsFeatureExistForChain } from './index';

const NETWORK = 'mainnet';

export function useFillAggregatedStake(
  denoms: DenomsRecord,
  chain: SupportedChain,
  setAggregatedStake: (aggregatedStake: AggregatedStake) => void,
) {
  const { lcdUrl } = useChainApis(chain, NETWORK);
  const address = useAddress(chain);
  const [activeStakingDenom] = useActiveStakingDenom(denoms, chain);
  const chainId = useChainId(chain, NETWORK);
  const [preferredCurrency] = useUserPreferredCurrency();
  const chains = useGetChains();
  const getIbcDenomInfo = useGetIbcDenomInfo(denoms);

  const isStakeComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'stake',
    platform: getPlatformType(),
    forceChain: chain,
    forceNetwork: NETWORK,
  });

  const isStakeNotSupported = useIsFeatureExistForChain({
    checkForExistenceType: 'notSupported',
    feature: 'stake',
    platform: getPlatformType(),
    forceChain: chain,
    forceNetwork: NETWORK,
  });

  useQuery(
    [
      `query-fill-${chain}-aggregated-stake`,
      isStakeComingSoon,
      isStakeNotSupported,
      lcdUrl,
      address,
      chainId,
      activeStakingDenom,
      preferredCurrency,
      chain,
    ],
    async function () {
      if (isStakeComingSoon || isStakeNotSupported) {
        return;
      }

      const aggregatedStake: AggregatedStake = {
        perChainDelegations: {
          [chain]: {
            totalDelegationAmount: '0',
            currencyAmountDelegation: '0',
            stakingDenom: activeStakingDenom.coinDenom,
            apr: 0,
            claimRewards: '0',
            loading: true,
            totalDelegation: new BigNumber(0),
          },
        },
        totalCurrencyAmountDelegation: new BigNumber(0),
        averageApr: 0,
        totalClaimRewardsAmount: new BigNumber(0),
        isEveryChainLoading: false,
        isSomeChainLoading: false,
      };

      setAggregatedStake({
        ...aggregatedStake,
      });

      const [delegationsResponse, chainInfoResponse, claimRewardsResponse] = await Promise.allSettled([
        getDelegationsForChain({
          lcdUrl: lcdUrl ?? '',
          address,
          activeStakingDenom,
          chainId: chainId ?? '',
          preferredCurrency,
          activeChain: chain,
        }),
        getChainInfo(chainId ?? '', false),
        getClaimRewardsForChain({
          lcdUrl: lcdUrl ?? '',
          address,
          selectedNetwork: NETWORK,
          preferredCurrency,
          chainInfos: chains,
          getIbcDenomInfo,
          activeStakingDenom,
        }),
      ]);

      // Delegations
      if (delegationsResponse.status === 'fulfilled' && delegationsResponse.value) {
        const { totalDelegationAmount, currencyAmountDelegation, totalDelegation } = delegationsResponse.value;

        aggregatedStake.perChainDelegations = {
          [chain]: {
            totalDelegationAmount,
            currencyAmountDelegation,
            stakingDenom: activeStakingDenom.coinDenom,
            apr: 0,
            claimRewards: '0',
            loading: false,
            totalDelegation,
          },
        };
      }

      // APR
      if (chainInfoResponse.status === 'fulfilled') {
        const calculatedApr = await getChainsApr(chain, false, chains, chainInfoResponse.value);
        const chainData = {
          params: { ...(chainInfoResponse.value?.params ?? {}), calculated_apr: calculatedApr },
        };
        const apr = chainData?.params?.calculated_apr ?? chainData?.params?.estimated_apr ?? 0;

        aggregatedStake.perChainDelegations = {
          [chain]: {
            ...(aggregatedStake.perChainDelegations[chain] ?? {}),
            apr: apr,
          },
        };
      }

      // Claim Rewards
      if (claimRewardsResponse.status === 'fulfilled' && claimRewardsResponse.value) {
        aggregatedStake.perChainDelegations = {
          [chain]: {
            ...(aggregatedStake.perChainDelegations[chain] ?? {}),
            claimRewards: claimRewardsResponse.value.totalRewardsDollarAmt,
          },
        };
      }

      aggregatedStake.perChainDelegations = {
        [chain]: {
          ...(aggregatedStake.perChainDelegations[chain] ?? {}),
          loading: false,
        },
      };

      setAggregatedStake({
        ...aggregatedStake,
      });
    },
  );

  return null;
}
