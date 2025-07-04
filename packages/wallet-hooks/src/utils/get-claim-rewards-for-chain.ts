import {
  axiosWrapper,
  ChainInfo,
  fromSmall,
  NativeDenom,
  RewardsResponse,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';

import { currencyDetail } from '../settings';
import { SupportedCurrencies } from '../types';
import { fetchCurrency, formatTokenAmount, getChainId } from './index';

export type GetClaimRewardsForChainParams = {
  lcdUrl: string;
  address: string;
  isCancelled?: boolean;
  selectedNetwork: 'mainnet' | 'testnet';
  preferredCurrency: SupportedCurrencies;
  chainInfos: Record<SupportedChain, ChainInfo>;
  getIbcDenomInfo: any;
  activeStakingDenom: NativeDenom;
};

export async function getClaimRewardsForChain({
  lcdUrl,
  address,
  isCancelled = false,
  selectedNetwork,
  preferredCurrency,
  chainInfos,
  getIbcDenomInfo,
  activeStakingDenom,
}: GetClaimRewardsForChainParams) {
  const res = await axiosWrapper({
    baseURL: lcdUrl,
    method: 'get',
    url: `/cosmos/distribution/v1beta1/delegators/${address}/rewards`,
  });

  if (isCancelled) return;
  const { total, rewards: _rewards } = res.data as RewardsResponse;

  const claimTotal = await Promise.all(
    total.map(async (claim) => {
      const { amount: _amount, denom } = claim;
      const { denomInfo: _denomInfo } = await getIbcDenomInfo(denom);
      const denomInfo = _denomInfo || activeStakingDenom;
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
        amount: denomInfo ? amount : '0',
        currencyAmount,
        formatted_amount,
        tokenInfo: denomInfo,
        denomFiatValue,
      };
    }),
  );

  if (isCancelled) return;
  let totalRewardsDollarAmt = '0';
  if (claimTotal[0]) {
    totalRewardsDollarAmt = claimTotal
      .reduce((totalSum, token) => {
        return totalSum.plus(new BigNumber(token.currencyAmount ?? ''));
      }, new BigNumber('0'))
      .toString();
  }

  return {
    totalRewardsDollarAmt,
    claimTotal,
    _rewards,
  };
}
