import { Aptos, APTOS_COIN, AptosConfig } from '@aptos-labs/ts-sdk';
import { aptosChainNativeTokenMapping, axiosWrapper } from '@leapwallet/cosmos-wallet-sdk';
import { AxiosError } from 'axios';
import { makeObservable } from 'mobx';

import { BaseQueryStore } from '../base/base-data-store';
import { IRawBalanceResponse } from './bitcoin-balance-store';

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

  async getNativeTokenBalance() {
    try {
      const config = new AptosConfig({
        fullnode: this.restUrl,
      });
      const aptos = new Aptos(config);
      const balance = await aptos.getAccountCoinAmount({
        accountAddress: this.address,
        coinType: APTOS_COIN,
      });
      if (balance > 0) {
        return {
          denom: aptosChainNativeTokenMapping[this.chain],
          amount: BigInt(balance).toString(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching Native balance', error);
      return null;
    }
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

      let foundNativeToken = false;
      // Extract balances
      const balances: IRawBalanceResponse['balances'] =
        coinStores?.map((store: any) => {
          const type = store.type.replace('0x1::coin::CoinStore<', '').replace('>', '');
          if (type === APTOS_COIN) {
            if (store.data.coin.value > 0) {
              foundNativeToken = true;
            }
            return {
              denom: aptosChainNativeTokenMapping[this.chain],
              amount: BigInt(store.data.coin.value).toString(),
            };
          }

          return {
            denom: type,
            amount: BigInt(store.data.coin.value).toString(),
          };
        }) ?? [];

      if (!foundNativeToken) {
        const nativeBalance = await this.getNativeTokenBalance();
        if (nativeBalance) {
          balances.unshift(nativeBalance);
        }
      }

      return {
        balances,
        pagination: { next_key: null, total: balances?.length?.toString() || '0' },
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.error_code === 'account_not_found') {
        const balances: IRawBalanceResponse['balances'] = [];
        const nativeBalance = await this.getNativeTokenBalance();
        if (nativeBalance) {
          balances.unshift(nativeBalance);
        }
        return {
          balances,
          pagination: { next_key: null, total: '0' },
        };
      }
      throw error;
    }
  }
}
