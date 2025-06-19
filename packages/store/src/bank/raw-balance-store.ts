import { axiosWrapper, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable } from 'mobx';

import { BaseQueryStore } from '../base/base-data-store';
import { IRawBalanceResponse } from './bitcoin-balance-store';

export class RawBalanceStore extends BaseQueryStore<IRawBalanceResponse> {
  chain: SupportedChain;
  restUrl: string;
  type: 'balances' | 'spendable_balances';
  address: string;
  paginationLimit: number;

  constructor(
    restUrl: string,
    address: string,
    chain: SupportedChain,
    type: 'balances' | 'spendable_balances',
    paginationLimit: number = 1000,
  ) {
    super();
    makeObservable(this);

    this.restUrl = restUrl;
    this.address = address;
    this.type = type;
    this.chain = chain;
    this.paginationLimit = paginationLimit;
  }

  async fetchData() {
    const res = await axiosWrapper({
      baseURL: this.restUrl,
      method: 'get',
      url: `/cosmos/bank/v1beta1/${this.type}/${this.address}?pagination.limit=${this.paginationLimit}`,
    });

    const response = res.data;
    return response;
  }
}
