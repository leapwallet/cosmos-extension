import {
  axiosWrapper,
  fromSmall,
  ProviderDelegation,
  ProviderDelegationResponse,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';

import { currencyDetail } from '../settings';
import { fetchCurrency } from './findUSDValue';
import { GetDelegationForChainParams } from './get-delegations-for-chain';
import { formatTokenAmount } from './strings';

export type GetProviderDelegationReturn = {
  delegations: Record<string, ProviderDelegation>;
  totalDelegationAmount: string;
  currencyAmountDelegation: string;
  totalDelegation: BigNumber;
};

export async function getProviderDelegations({
  lcdUrl,
  address,
  isCancelled = false,
  activeStakingDenom,
  chainId,
  preferredCurrency,
}: GetDelegationForChainParams): Promise<GetProviderDelegationReturn | undefined> {
  const res = await axiosWrapper({
    baseURL: lcdUrl,
    method: 'get',
    url: '/lavanet/lava/dualstaking/delegator_providers/' + address,
    params: {
      with_pending: true,
    },
  });

  if (isCancelled) return;
  const { delegations: delegation_responses } = res.data as ProviderDelegationResponse;

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

  delegation_responses.forEach((delegation) => {
    delegation.amount.amount = fromSmall(delegation.amount.amount, activeStakingDenom.coinDecimals);
  });

  const rawDelegations: Record<string, ProviderDelegation> = delegation_responses.reduce(
    (a: any, v: any) => ({ ...a, [v.provider]: v }),
    {},
  );

  const delegations = Object.entries(rawDelegations)
    .filter(([, d]) => new BigNumber(d.amount.amount).gt(0))
    .reduce((formattedDelegations, [provider, d]) => {
      d.amount.currencyAmount = new BigNumber(d.amount.amount).multipliedBy(denomFiatValue ?? '0').toString();
      d.amount.formatted_amount = formatTokenAmount(d.amount.amount, activeStakingDenom.coinDenom, 6);
      return { [provider]: d, ...formattedDelegations };
    }, {});

  const tda = Object.values(rawDelegations)
    .reduce((acc, v) => acc.plus(v.amount.amount), new BigNumber(0))
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
