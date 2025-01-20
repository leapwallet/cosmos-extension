import { APTOS_COIN } from '@aptos-labs/ts-sdk';
import { aptosChainNativeTokenMapping, axiosWrapper } from '@leapwallet/cosmos-wallet-sdk';
import { AxiosError } from 'axios';
import { makeObservable } from 'mobx';

import { BaseQueryStore } from '../base/base-data-store';

export interface IRawBalanceResponse {
  balances: Array<{ amount: string; denom: string }>;
  pagination: { next_key: any; total: string };
}

export class AptosBalanceStore extends BaseQueryStore<IRawBalanceResponse> {
  restUrl: string;
  address: string;
  chain: string;

  constructor(restUrl: string, address: string, chain: string) {
    super();
    makeObservable(this);

    this.restUrl = restUrl;
    this.address = address;
    this.chain = chain;
  }

  async fetchData() {
    try {
      const { data } = await axiosWrapper({
        baseURL: this.restUrl,
        method: 'get',
        url: `/accounts/${this.address}/resources?limit=999`,
      });
      // Filter for CoinStore resources
      const coinStores = data.filter((r: any) => r.type.includes('0x1::coin::CoinStore'));

      // Extract balances
      const balances = coinStores.map((store: any) => {
        const type = store.type.replace('0x1::coin::CoinStore<', '').replace('>', '');
        if (type === APTOS_COIN) {
          return {
            denom: aptosChainNativeTokenMapping[this.chain],
            amount: BigInt(store.data.coin.value),
          };
        }

        return {
          denom: type,
          amount: BigInt(store.data.coin.value),
        };
      });
      return {
        balances,
        pagination: { next_key: null, total: balances?.length?.toString() || '0' },
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.error_code === 'account_not_found') {
        return {
          balances: [],
          pagination: { next_key: null, total: '0' },
        };
      }
      throw error;
    }
  }
}
