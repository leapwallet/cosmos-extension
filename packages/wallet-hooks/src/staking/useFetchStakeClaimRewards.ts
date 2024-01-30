import { axiosWrapper, fromSmall, RewardsResponse, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';
import { useEffect } from 'react';

import { currencyDetail, useUserPreferredCurrency } from '../settings';
import {
  useActiveChain,
  useAddress,
  useChainApis,
  useDenoms,
  useGetChains,
  useSelectedNetwork,
  useStakeClaimRewardsStore,
} from '../store';
import { fetchCurrency, formatTokenAmount, useGetIbcDenomInfo } from '../utils';

export function useFetchStakeClaimRewards(forceChain?: SupportedChain, forceNetwork?: 'mainnet' | 'testnet') {
  const _activeChain = useActiveChain();
  const activeChain = forceChain ?? _activeChain;

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);
  const address = useAddress();
  const getIbcDenomInfo = useGetIbcDenomInfo();
  const [preferredCurrency] = useUserPreferredCurrency();
  const { setClaimRewards, setClaimStatus, setClaimIsFetching, setClaimRefetch } = useStakeClaimRewardsStore();

  const denoms = useDenoms();
  const chainInfos = useGetChains();
  const activeChainInfo = chainInfos[activeChain];

  const fetchClaimRewards = async () => {
    try {
      const res = await axiosWrapper({
        baseURL: lcdUrl,
        method: 'get',
        url: `/cosmos/distribution/v1beta1/delegators/${address}/rewards`,
      });

      const { rewards: _rewards, total } = res.data as RewardsResponse;
      const rewards = _rewards.reduce((a: any, v: any) => ({ ...a, [v.validator_address]: v }), {});

      const claimTotal = await Promise.all(
        total.map(async (claim) => {
          const { amount: _amount, denom } = claim;
          const { denomInfo } = await getIbcDenomInfo(denom);
          const amount = fromSmall(_amount, denomInfo?.coinDecimals ?? 6);

          let denomFiatValue = '0';
          if (denomInfo?.coinGeckoId) {
            denomFiatValue =
              (await fetchCurrency(
                '1',
                denomInfo.coinGeckoId,
                denomInfo.chain as SupportedChain,
                currencyDetail[preferredCurrency].currencyPointer,
              )) ?? '0';
          }

          const currenyAmount = new BigNumber(amount).multipliedBy(denomFiatValue).toString();

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
            currenyAmount,
            formatted_amount,
            tokenInfo: denomInfo,
            denomFiatValue,
          };
        }),
      );

      const totalRewards = await Promise.all(
        _rewards.map(async (_reward) => {
          const reward = await Promise.all(
            _reward?.reward.map(async (claim) => {
              const { amount: _amount, denom } = claim;
              const denomInfo = claimTotal.find((token) => token.denom === denom);
              const amount = fromSmall(_amount, denomInfo?.tokenInfo?.coinDecimals ?? 6);

              const denomFiatValue = denomInfo?.denomFiatValue ?? '0';
              const currenyAmount = new BigNumber(amount).multipliedBy(denomFiatValue).toString();

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
                currenyAmount,
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

      const totalRewardsAmt = claimTotal
        .reduce((a, v) => {
          return a + +v.amount;
        }, 0)
        .toString();

      let totalRewardsDollarAmt = '0';
      if (claimTotal[0]) {
        totalRewardsDollarAmt = claimTotal
          .reduce((totalSum, token) => {
            return totalSum.plus(new BigNumber(token.currenyAmount ?? ''));
          }, new BigNumber('0'))
          .toString();
      }

      let formattedTotalRewardsAmt = formatTokenAmount(totalRewardsAmt, activeChainInfo.denom, 4);
      if (formattedTotalRewardsAmt === 'NaN') {
        formattedTotalRewardsAmt = '0 ' + activeChainInfo.denom;
      }

      setClaimRewards({
        rewards,
        result: { rewards: totalRewards, total: claimTotal },
        totalRewards: totalRewardsAmt,
        formattedTotalRewards: formattedTotalRewardsAmt,
        totalRewardsDollarAmt,
      });
      setClaimStatus('success');
    } catch (_) {
      setClaimRewards({});
      setClaimStatus('error');
    }
  };

  useEffect(() => {
    if (
      activeChainInfo?.comingSoonFeatures?.includes('stake') ||
      activeChainInfo?.notSupportedFeatures?.includes('stake')
    ) {
      setTimeout(() => {
        setClaimStatus('success');
        setClaimRewards({});
      }, 0);

      return;
    }

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
    }
  }, [lcdUrl, address, denoms, activeChain, selectedNetwork, activeChainInfo]);
}
