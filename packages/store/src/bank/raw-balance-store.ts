import { axiosWrapper, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable } from 'mobx';

import { BaseQueryStore } from '../base/base-data-store';
import { IRawBalanceResponse } from './bitcoin-balance-store';

export class RawBalanceStore extends BaseQueryStore<IRawBalanceResponse> {
  chain: SupportedChain;
  restUrl: string;
  type: 'balances' | 'spendable_balances';
  address: string;

  constructor(restUrl: string, address: string, chain: SupportedChain, type: 'balances' | 'spendable_balances') {
    super();
    makeObservable(this);

    this.restUrl = restUrl;
    this.address = address;
    this.type = type;
    this.chain = chain;
  }

  async fetchData() {
    const res = await axiosWrapper({
      baseURL: this.restUrl,
      method: 'get',
      url: `/cosmos/bank/v1beta1/${this.type}/${this.address}?pagination.limit=1000`,
    });

    const response = res.data;
    return response;
  }
}
