import { axiosWrapper } from '@leapwallet/cosmos-wallet-sdk';
import { makeObservable } from 'mobx';

import { BaseQueryStore } from '../base/base-data-store';

export interface IRawBalanceResponse {
  balances: Array<{ amount: string; denom: string }>;
  pagination: { next_key: any; total: string };
}

export class BitcoinBalanceStore extends BaseQueryStore<IRawBalanceResponse> {
  rpcUrl: string;
  address: string;
  chain: string;

  constructor(rpcUrl: string, address: string, chain: string) {
    super();
    makeObservable(this);

    this.rpcUrl = rpcUrl;
    this.address = address;
    this.chain = chain;
  }

  async fetchData() {
    const { data } = await axiosWrapper({
      baseURL: this.rpcUrl,
      method: 'get',
      url: `/address/${this.address}/utxo`,
    });

    let totalAmount = 0;
    data.forEach((utxo: any) => {
      totalAmount += utxo.value;
    });

    return {
      balances: [
        {
          amount: totalAmount.toString(),
          denom: this.chain === 'bitcoin' ? 'bitcoin-native' : 'bitcoin-signet-native',
        },
      ],
      pagination: { next_key: null, total: '1' },
    };
  }
}
