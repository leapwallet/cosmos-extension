import { fromSmall, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { makeAutoObservable, onBecomeObserved, reaction, runInAction } from 'mobx';
import { AggregatedSupportedChainType } from 'types';

import { ChainInfosStore, DenomsStore, NmsStore } from '../assets';
import { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';
import { sortTokenBalances } from './balance-calculator';
import { PriceStore } from './balance-store';
import { Token } from './balance-types';

const LIMIT = 50;

export class AsteroidDenomBalanceStore {
  chainWiseBalances: Record<string, Array<Token>> = {};
  balancesReady: boolean = false;
  chainWiseLoadingStatus: Record<string, boolean> = {};
  chainInfosStore: ChainInfosStore;
  nmsStore: NmsStore;
  addressStore: AddressStore;
  denomsStore: DenomsStore;
  selectedNetworkStore: SelectedNetworkStore;
  priceStore: PriceStore;
  activeChainStore: ActiveChainStore;

  constructor(
    chainInfosStore: ChainInfosStore,
    nmsStore: NmsStore,
    activeChainStore: ActiveChainStore,
    addressStore: AddressStore,
    selectedNetworkStore: SelectedNetworkStore,
    denomsStore: DenomsStore,
    priceStore: PriceStore,
  ) {
    makeAutoObservable(this);

    this.chainInfosStore = chainInfosStore;
    this.addressStore = addressStore;
    this.activeChainStore = activeChainStore;
    this.nmsStore = nmsStore;
    this.denomsStore = denomsStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.priceStore = priceStore;

    // onBecomeObserved(this, 'chainWiseBalances', () => {
    //   this.initialize();
    // });

    // reaction(
    //   () => this.addressStore.addresses,
    //   async () => {
    //     await this.initialize();
    //     if (this.addressStore.addresses) {
    //       this.fetchChainBalances();
    //     }
    //   },
    // );
    //
    // reaction(
    //   () => this.activeChainStore.activeChain,
    //   async (chain) => {
    //     await this.initialize();
    //     const chainKey = this.getChainKey(chain);
    //     if (!this.chainWiseBalances[chainKey] && chain !== 'aggregated') {
    //       this.fetchChainBalances(chain as SupportedChain);
    //     }
    //   },
    // );
    //
    // reaction(
    //   () => this.selectedNetworkStore.selectedNetwork,
    //   async () => {
    //     await this.initialize();
    //     const activeChain = this.activeChainStore.activeChain;
    //     const chainKey = this.getChainKey(activeChain);
    //     if (!this.chainWiseBalances[chainKey] && activeChain !== 'aggregated') {
    //       this.fetchChainBalances(activeChain);
    //     }
    //   },
    // );
  }

  async fetchChainBalances(forceChain?: SupportedChain) {
    const chain = forceChain || this.activeChainStore.activeChain;
    const chainKey = this.getChainKey(chain);
    if (this.chainWiseLoadingStatus[chainKey]) return;
    runInAction(() => {
      this.chainWiseLoadingStatus[chainKey] = true;
    });
    try {
      if (chain === 'cosmos' && this.selectedNetworkStore.selectedNetwork === 'mainnet') {
        const address = this.addressStore.addresses?.[chain];
        if (!address) return;
        const chainId = this.chainInfosStore.chainInfos[chain].chainId;
        const tokens = await this.fetchTokens(address, chainId);
        runInAction(() => {
          this.chainWiseBalances[chainKey] = tokens;
        });
      } else {
        runInAction(() => {
          this.chainWiseBalances[chainKey] = [];
        });
      }
    } finally {
      runInAction(() => {
        this.chainWiseLoadingStatus[chainKey] = false;
      });
    }
  }

  async initialize() {
    await Promise.all([
      this.nmsStore.readyPromise,
      this.denomsStore.readyPromise,
      this.activeChainStore.readyPromise,
      this.selectedNetworkStore.readyPromise,
      this.priceStore.readyPromise,
    ]);
  }

  private getChainKey(chain: AggregatedSupportedChainType): string {
    if (chain === 'aggregated') return 'aggregated';
    const chainId =
      this.selectedNetworkStore.selectedNetwork === 'testnet'
        ? this.chainInfosStore.chainInfos[chain].testnetChainId
        : this.chainInfosStore.chainInfos[chain].chainId;
    return `${chain}-${chainId}`;
  }

  private async fetchTokens(address: string, chainId: string, offset = 0, tokens: any[] = []): Promise<any[]> {
    const TOKENS_QUERY = `
      {
          token_holder(offset: ${offset}, limit: ${LIMIT}, where: {address: {_eq:"${address}"}, chain_id: {_eq: "${chainId}"}}, order_by: {token_id: asc}) {
              token {
                  id
                  name
                  ticker
                  decimals
                  content_path
                  last_price_base
              }
              amount
          }
      }
      `;

    const {
      data: {
        data: { token_holder },
      },
    } = await axios({
      url: 'https://api.asteroidprotocol.io/v1/graphql',
      method: 'POST',
      data: {
        query: TOKENS_QUERY,
      },
      timeout: 20000,
    });

    tokens = [...tokens, ...token_holder];

    if (token_holder.length === LIMIT) {
      return this.fetchTokens(address, chainId, tokens.length, tokens);
    }

    return tokens;
  }

  formatBalance(balance: { amount: BigNumber; token: any }, chain: AggregatedSupportedChainType) {
    if (chain === 'aggregated') throw new Error('Invalid chain');
    const chainInfos = this.chainInfosStore.chainInfos;
    const coingeckoPrices = this.priceStore.data;
    const chainInfo = chainInfos[chain as SupportedChain];
    const denoms = this.denomsStore.denoms;
    const uAtomToken = denoms.uatom;

    const token = balance.token;
    const { decimals, id, name, ticker, content_path, last_price_base } = token;
    const amount = fromSmall(new BigNumber(token.amount).toString(), decimals);

    let oneAtomUsdValue;
    if (parseFloat(amount) > 0) {
      if (coingeckoPrices) {
        let tokenPrice;
        const coinGeckoId = uAtomToken.coinGeckoId;
        const alternateCoingeckoKey = `${chainInfo.chainId}-${uAtomToken.coinMinimalDenom}`;

        if (coinGeckoId) {
          tokenPrice = coingeckoPrices[coinGeckoId];
        }
        if (!tokenPrice) {
          tokenPrice = coingeckoPrices[alternateCoingeckoKey];
        }
        if (tokenPrice) {
          oneAtomUsdValue = new BigNumber(amount).times(tokenPrice).toString();
        }
      }
    }

    const usdValue = oneAtomUsdValue
      ? String((last_price_base / 10 ** uAtomToken.coinDecimals) * parseFloat(oneAtomUsdValue))
      : undefined;
    const usdPrice = '0';

    const formattedBalance: Token = {
      chain: '',
      name,
      amount,
      symbol: ticker,
      usdValue,
      coinMinimalDenom: id,
      img: content_path,
      ibcDenom: '',
      usdPrice,
      coinDecimals: decimals,
    };

    return formattedBalance;
  }

  get asteroidTokens() {
    const activeChain = this.activeChainStore.activeChain;
    const chainKey = this.getChainKey(activeChain);
    return sortTokenBalances(Object.values(this.chainWiseBalances[chainKey] ?? {}));
  }

  get loading() {
    const activeChain = this.activeChainStore.activeChain;
    const chainKey = this.getChainKey(activeChain);
    return this.chainWiseLoadingStatus[chainKey] ?? false;
  }
}
