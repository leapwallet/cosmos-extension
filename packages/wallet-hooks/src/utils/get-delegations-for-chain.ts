import {
  axiosWrapper,
  Delegation,
  DelegationResponse,
  fromSmall,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';

import { currencyDetail } from '../settings';
import { Amount, SupportedCurrencies } from '../types';
import { fetchCurrency, formatTokenAmount } from './index';

export type GetDelegationForChainParams = {
  lcdUrl: string;
  address: string;
  isCancelled?: boolean;
  activeStakingDenom: NativeDenom;
  chainId: string;
  preferredCurrency: SupportedCurrencies;
  activeChain: SupportedChain;
};

export type GetDelegationForChainReturn = {
  delegations: Record<string, Delegation>;
  totalDelegationAmount: string;
  currencyAmountDelegation: string;
  totalDelegation: BigNumber;
};

export async function getDelegationsForChain({
  lcdUrl,
  address,
  isCancelled = false,
  activeStakingDenom,
  chainId,
  preferredCurrency,
  activeChain,
}: GetDelegationForChainParams): Promise<GetDelegationForChainReturn | undefined> {
  const res = await axiosWrapper({
    baseURL: lcdUrl,
    method: 'get',
    url:
      (activeChain === 'initia' ? '/initia/mstaking/v1/delegations/' : '/cosmos/staking/v1beta1/delegations/') +
      address,
  });

  if (isCancelled) return;
  let { delegation_responses } = res.data as DelegationResponse;
  let denomFiatValue: string | undefined = undefined;

  if (activeStakingDenom.coinGeckoId) {
    denomFiatValue = await fetchCurrency(
      '1',
      activeStakingDenom.coinGeckoId,
      activeStakingDenom?.chain as SupportedChain,
      currencyDetail[preferredCurrency].currencyPointer,
      `${chainId}-${activeStakingDenom?.coinMinimalDenom} `,
    );

    if (isCancelled) return;
  }

  if (activeChain === 'initia') {
    delegation_responses = delegation_responses.reduce((acc: Delegation[], delegation: Delegation) => {
      const uinitDelegation = (delegation.balance as unknown as Amount[]).find(
        (balance) => balance.denom === activeStakingDenom.coinMinimalDenom,
      );

      if (uinitDelegation) {
        acc.push({
          ...delegation,
          balance: {
            ...uinitDelegation,
          },
        });
      }

      return acc;
    }, []);
  }

  delegation_responses.forEach((delegation) => {
    delegation.balance.amount = fromSmall(delegation.balance.amount, activeStakingDenom.coinDecimals);
  });

  const rawDelegations: Record<string, Delegation> = delegation_responses.reduce(
    (a, v) => ({ ...a, [v.delegation.validator_address]: v }),
    {},
  );

  const delegations = Object.entries(rawDelegations)
    .filter(([, d]) => new BigNumber(d.balance.amount).gt(0))
    .reduce((formattedDelegations, [validator, d]) => {
      d.balance.currencyAmount = new BigNumber(d.balance.amount).multipliedBy(denomFiatValue ?? '0').toString();
      d.balance.formatted_amount = formatTokenAmount(d.balance.amount, activeStakingDenom.coinDenom, 6);
      return { [validator]: d, ...formattedDelegations };
    }, {});

  const tda = Object.values(rawDelegations)
    .reduce((acc, v) => acc.plus(v.balance.amount), new BigNumber(0))
    .toString();
  const totalDelegationAmount = formatTokenAmount(tda, activeStakingDenom.coinDenom);
  const currencyAmountDelegation = new BigNumber(tda).multipliedBy(denomFiatValue ?? '0').toString();

  return {
    delegations,
    totalDelegationAmount,
    currencyAmountDelegation,
    totalDelegation: new BigNumber(tda),
  };
}
