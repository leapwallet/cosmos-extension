import { DenomsRecord } from 'types';

import { SupportedDenoms } from '../constants';
import { axiosWrapper } from '../healthy-nodes';
import {
  Delegation,
  DelegationResponse,
  Reward,
  RewardsResponse,
  UnbondingDelegation,
  UnbondingDelegationResponse,
} from '../types/staking';
import { fromSmall } from '../utils';

export const getDelegations = async (
  address: string,
  restUrl: string,
  denoms: DenomsRecord,
): Promise<Record<string, Delegation>> => {
  const res = await axiosWrapper({
    baseURL: restUrl,
    method: 'get',
    url: '/cosmos/staking/v1beta1/delegations/' + address,
  });
  const result = res.data as DelegationResponse;

  result.delegation_responses.map(
    (r) => (r.balance.amount = fromSmall(r.balance.amount, denoms[r.balance.denom]?.coinDecimals ?? 6)),
  );
  const delegations: Record<string, Delegation> = result.delegation_responses.reduce(
    (a, v) => ({ ...a, [v.delegation.validator_address]: v }),
    {},
  );
  return delegations;
};

export const getRewards = async (address: string, restUrl: string, opts: any, getIbcDenomInfo?: any) => {
  const res = await axiosWrapper({
    baseURL: restUrl,
    method: 'get',
    url: `/cosmos/distribution/v1beta1/delegators/${address}/rewards`,
    ...opts,
  });

  const result = res.data as RewardsResponse;

  const resultRewards = await Promise.all(
    result?.rewards.map(async (r) => {
      const reward = await Promise.all(
        r?.reward.map(async (c) => {
          const denomInfo = await getIbcDenomInfo(c.denom);
          const amount = fromSmall(c?.amount, denomInfo?.coinDecimals ?? 6);

          return {
            ...c,
            amount,
          };
        }),
      );

      return {
        ...r,
        reward,
      };
    }),
  );

  const resultTotal = await Promise.all(
    result?.total.map(async (c) => {
      const denomInfo = await getIbcDenomInfo(c.denom);
      const amount = fromSmall(c?.amount, denomInfo?.coinDecimals ?? 6);

      return {
        ...c,
        amount,
      };
    }),
  );

  const rewards = result?.rewards.reduce((a: any, v: any) => ({ ...a, [v.validator_address]: v }), {}) as Record<
    string,
    Reward
  >;
  const _result = { rewards: resultRewards, total: resultTotal };

  return { rewards, result: _result };
};

const StakeQueryClient = async (chainId: string, restUrls: string, denoms: DenomsRecord) => {
  const restUrl = restUrls;

  const getUnbondingDelegations = async (address: string, denom: SupportedDenoms) => {
    const res = await axiosWrapper({
      baseURL: restUrl,
      method: 'get',
      url: '/cosmos/staking/v1beta1/delegators/' + address + '/unbonding_delegations',
    });

    const result = res.data as UnbondingDelegationResponse;

    result.unbonding_responses.map((r) => {
      r.entries.map((e) => {
        e.balance = fromSmall(e.balance, denoms[denom].coinDecimals);
        e.initial_balance = fromSmall(e.initial_balance, denoms[denom].coinDecimals);
        return e;
      });
      return r;
    });

    const delegations: Record<string, UnbondingDelegation> = result.unbonding_responses.reduce(
      (a, v) => ({ ...a, [v.validator_address]: v }),
      {},
    );
    return delegations;
  };

  return {
    connected: !!restUrl,
    restUrl,
    getUnbondingDelegations,
    getDelegations: (address: string) => getDelegations(address, restUrl, denoms),
    getRewards: (address: string, opts: any, getIbcDenomInfo?: any) =>
      getRewards(address, restUrl, opts, getIbcDenomInfo),
  };
};

export default StakeQueryClient;
