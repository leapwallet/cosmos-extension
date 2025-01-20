import { axiosWrapper } from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';
import { makeObservable } from 'mobx';

import { BaseQueryStore } from '../base/base-data-store';
import { StakeEpochStore } from '../stake/epoch-store';
import { IRawBalanceResponse } from './bitcoin-balance-store';

export class BabylonBalanceStore extends BaseQueryStore<IRawBalanceResponse> {
  restUrl: string;
  type: 'balances' | 'spendable_balances';
  address: string;
  stakeEpochStore: StakeEpochStore;

  constructor(
    restUrl: string,
    address: string,
    type: 'balances' | 'spendable_balances',
    stakeEpochStore: StakeEpochStore,
  ) {
    super();
    makeObservable(this);

    this.restUrl = restUrl;
    this.address = address;
    this.type = type;
    this.stakeEpochStore = stakeEpochStore;
  }

  async fetchData() {
    const res = await axiosWrapper<IRawBalanceResponse>({
      method: 'get',
      baseURL: this.restUrl,
      url: `/cosmos/bank/v1beta1/${this.type}/${this.address}?pagination.limit=1000`,
    });

    const response = res.data;
    if (!response?.balances?.length) {
      return response;
    }

    await this.stakeEpochStore.refetchData(); // refetch stake epoch data to get the latest delegated amount
    if (this.stakeEpochStore.totalDelegatedAmount.gt(0)) {
      response.balances = response.balances.map((balance) => {
        balance.amount = new BigNumber(balance.amount).minus(this.stakeEpochStore.totalDelegatedAmount).toString();

        return balance;
      });
    }

    return response;
  }
}
