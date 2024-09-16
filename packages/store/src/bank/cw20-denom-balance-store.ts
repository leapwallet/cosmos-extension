import { fetchCW20Balances, fromSmall, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { AggregatedSupportedChainType, SelectedNetworkType } from 'types';

import {
  AggregatedChainsStore,
  AutoFetchedCW20DenomsStore,
  BetaCW20DenomsStore,
  ChainInfosStore,
  CW20DenomsStore,
  DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
  NmsStore,
} from '../assets';
import { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';
import { sortTokenBalances } from './balance-calculator';
import { PriceStore } from './balance-store';
import { Token } from './balance-types';

export class CW20DenomBalanceStore {
  chainWiseBalances: Record<string, Record<string, Token>> = {};
  rawBalances: Record<string, Record<string, any>> = {};
  aggregatedLoadingStatus: boolean = false;
  chainWiseLoadingStatus: Record<string, boolean> = {};
  chainInfosStore: ChainInfosStore;
  nmsStore: NmsStore;
  addressStore: AddressStore;
  denomsStore: DenomsStore;
  cw20DenomsStore: CW20DenomsStore;
  betaCW20DenomsStore: BetaCW20DenomsStore;
  enabledCW20DenomsStore: EnabledCW20DenomsStore;
  disabledCW20DenomsStore: DisabledCW20DenomsStore;
  autoFetchedCW20DenomsStore: AutoFetchedCW20DenomsStore;
  selectedNetworkStore: SelectedNetworkStore;
  priceStore: PriceStore;
  activeChainStore: ActiveChainStore;
  aggregatedChainsStore: AggregatedChainsStore;

  constructor(
    chainInfosStore: ChainInfosStore,
    nmsStore: NmsStore,
    activeChainStore: ActiveChainStore,
    addressStore: AddressStore,
    selectedNetworkStore: SelectedNetworkStore,
    denomsStore: DenomsStore,
    cw20DenomsStore: CW20DenomsStore,
    autoFetchedCW20DenomsStore: AutoFetchedCW20DenomsStore,
    betaCW20DenomsStore: BetaCW20DenomsStore,
    enabledCW20DenomsStore: EnabledCW20DenomsStore,
    disabledCW20DenomsStore: DisabledCW20DenomsStore,
    priceStore: PriceStore,
    aggregatedChainsStore: AggregatedChainsStore,
  ) {
    makeAutoObservable(this);

    this.chainInfosStore = chainInfosStore;
    this.addressStore = addressStore;
    this.activeChainStore = activeChainStore;
    this.nmsStore = nmsStore;
    this.denomsStore = denomsStore;
    this.cw20DenomsStore = cw20DenomsStore;
    this.autoFetchedCW20DenomsStore = autoFetchedCW20DenomsStore;
    this.betaCW20DenomsStore = betaCW20DenomsStore;
    this.enabledCW20DenomsStore = enabledCW20DenomsStore;
    this.disabledCW20DenomsStore = disabledCW20DenomsStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.priceStore = priceStore;
    this.aggregatedChainsStore = aggregatedChainsStore;
  }

  async initialize() {
    await Promise.all([
      this.nmsStore.readyPromise,
      this.denomsStore.readyPromise,
      this.activeChainStore.readyPromise,
      this.cw20DenomsStore.readyPromise,
      this.autoFetchedCW20DenomsStore.readyPromise,
      this.betaCW20DenomsStore.readyPromise,
      this.enabledCW20DenomsStore.readyPromise,
      this.selectedNetworkStore.readyPromise,
      this.disabledCW20DenomsStore.readyPromise,
      this.priceStore.readyPromise,
    ]);
  }

  async fetchChainBalances(forceChain?: AggregatedSupportedChainType, forceNetwork?: SelectedNetworkType) {
    const _activeChain = this.activeChainStore.activeChain;
    const activeChain = forceChain ?? _activeChain;
    const _network = this.selectedNetworkStore.selectedNetwork;
    const network = forceNetwork ?? _network;

    if (activeChain === 'aggregated') {
      runInAction(() => {
        this.aggregatedLoadingStatus = true;
      });

      await Promise.allSettled(
        this.aggregatedChainsStore.aggregatedChainsData.map((chain) =>
          this.fetchCW20TokenBalances(chain as SupportedChain, network),
        ),
      );
      runInAction(() => {
        this.aggregatedLoadingStatus = false;
      });
      return;
    }

    await this.fetchCW20TokenBalances(activeChain, network);
  }

  async fetchCW20TokenBalances(
    activeChain: SupportedChain,
    network: SelectedNetworkType,
    forceCW20Denoms?: string[],
    skipStateUpdate = false,
  ): Promise<Token[] | undefined> {
    const cw20DenomAddresses = forceCW20Denoms ?? this.getCW20DenomAddresses(activeChain);

    const chainInfo = this.chainInfosStore.chainInfos[activeChain];
    if (!chainInfo || chainInfo?.evmOnlyChain) {
      return;
    }
    const chainId = network === 'testnet' ? chainInfo.testnetChainId : chainInfo.chainId;

    if (!chainId) return;
    const nodeUrlKey = network === 'testnet' ? 'rpcTest' : 'rpc';
    const hasEntryInNms = this.nmsStore.rpcEndPoints[chainId] && this.nmsStore.rpcEndPoints[chainId].length > 0;
    const rpcUrl = hasEntryInNms ? this.nmsStore.rpcEndPoints[chainId][0].nodeUrl : chainInfo.apis[nodeUrlKey];
    const address = this.addressStore.addresses[chainInfo.key];

    const balanceKey = this.getBalanceKey(activeChain);
    if (!rpcUrl || !address || !cw20DenomAddresses || cw20DenomAddresses.length === 0) {
      runInAction(() => {
        this.chainWiseLoadingStatus[balanceKey] = false;
      });
      return;
    }

    if (!skipStateUpdate) {
      runInAction(() => {
        if (!this.chainWiseBalances[balanceKey]) {
          this.chainWiseLoadingStatus[balanceKey] = true;
        }
      });
    }

    const formattedBalances: Token[] = [];
    let rawBalances: {
      denom: string;
      amount: BigNumber;
    }[] = [];

    try {
      rawBalances = await fetchCW20Balances(`${rpcUrl}/`, address, cw20DenomAddresses);
      if (rawBalances && rawBalances.length > 0) {
        await Promise.allSettled(
          rawBalances.map(async (balance) => {
            try {
              const formattedToken = this.formatBalance(balance, activeChain);
              if (formattedToken) {
                formattedBalances.push(formattedToken);
              }
            } catch (e) {
              console.error('Error while formatting balance', e);
            }
          }),
        );
      }
    } catch (e) {
      console.error('Error while fetching cw20 balances', e);
    }

    if (!skipStateUpdate) {
      runInAction(() => {
        rawBalances.forEach((balance) => {
          if (!this.rawBalances[balanceKey]) {
            this.rawBalances[balanceKey] = {};
          }
          this.rawBalances[balanceKey][balance.denom] = balance;
        });
        formattedBalances.forEach((balance) => {
          if (!this.chainWiseBalances[balanceKey]) {
            this.chainWiseBalances[balanceKey] = {};
          }
          this.chainWiseBalances[balanceKey][balance.coinMinimalDenom] = balance;
        });
        this.chainWiseLoadingStatus[balanceKey] = false;
      });
    }

    return formattedBalances;
  }

  private getBalanceKey(chain: AggregatedSupportedChainType): string {
    const chainKey = this.getChainKey(chain);
    const address = this.addressStore.addresses[chain];

    return `${chainKey}-${address}`;
  }

  private getChainKey(chain: AggregatedSupportedChainType): string {
    if (chain === 'aggregated') return 'aggregated';
    const chainId =
      this.selectedNetworkStore.selectedNetwork === 'testnet'
        ? this.chainInfosStore.chainInfos[chain].testnetChainId
        : this.chainInfosStore.chainInfos[chain].chainId;
    return `${chain}-${chainId}`;
  }

  getCW20DenomAddresses(chain: string): string[] {
    const cw20Denoms = this.cw20DenomsStore.denoms;
    const betaCW20Denoms = Object.keys(this.betaCW20DenomsStore.denoms?.[chain] ?? {});
    const enabledCW20Denoms = this.enabledCW20DenomsStore.enabledCW20Denoms;
    const disabledCW20Denoms = this.disabledCW20DenomsStore.disabledCW20Denoms;
    const autoFetchedCW20Denoms = this.autoFetchedCW20DenomsStore.chainWiseDenoms;

    const nonDisabledCW20Denoms = Object.keys(cw20Denoms?.[chain] ?? {}).filter(
      (token) => !disabledCW20Denoms.includes(token),
    );
    const enabledAutoFetchedCW20Denoms = Object.keys(autoFetchedCW20Denoms?.[chain] ?? {}).filter((token) =>
      enabledCW20Denoms.includes(token),
    );

    return [...nonDisabledCW20Denoms, ...enabledAutoFetchedCW20Denoms, ...betaCW20Denoms];
  }

  get combinedDenoms() {
    const denoms = this.denomsStore.denoms;
    const allAutoFetchedCW20Denoms = this.autoFetchedCW20DenomsStore.allAutoFetchedCW20Denoms;
    return { ...denoms, ...allAutoFetchedCW20Denoms };
  }

  formatBalance(balance: { amount: BigNumber; denom: string }, chain: SupportedChain) {
    const chainInfos = this.chainInfosStore.chainInfos;
    const coingeckoPrices = this.priceStore.data;

    const chainInfo = chainInfos[chain];
    let _denom = balance.denom;
    if (chain === 'noble' && _denom === 'uusdc') {
      _denom = 'usdc';
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore not sure why ts is complaining here
    const denomInfo = this.combinedDenoms?.[_denom];

    // if (!denom && chainInfo.beta) {
    //   if (Object.values(chainInfo.nativeDenoms)[0].coinMinimalDenom === _denom) {
    //     denom = Object.values(chainInfo.nativeDenoms)[0];
    //   }
    // }

    if (!denomInfo) {
      return null;
    }

    const amount = fromSmall(new BigNumber(balance.amount).toString(), denomInfo?.coinDecimals);

    let usdValue;
    if (parseFloat(amount) > 0) {
      if (coingeckoPrices) {
        let tokenPrice;
        const coinGeckoId = denomInfo.coinGeckoId;
        const alternateCoingeckoKey = `${chainInfo.chainId}-${denomInfo.coinMinimalDenom}`;

        if (coinGeckoId) {
          tokenPrice = coingeckoPrices[coinGeckoId];
        }
        if (!tokenPrice) {
          tokenPrice = coingeckoPrices[alternateCoingeckoKey];
        }
        if (tokenPrice) {
          usdValue = new BigNumber(amount).times(tokenPrice).toString();
        }
      }
    }

    const usdPrice = parseFloat(amount) > 0 && usdValue ? (Number(usdValue) / Number(amount)).toString() : '0';

    const formattedBalance: Token = {
      chain: denomInfo?.chain ?? '',
      name: denomInfo?.name,
      amount,
      symbol: denomInfo?.coinDenom,
      usdValue: usdValue ?? '',
      coinMinimalDenom: denomInfo?.coinMinimalDenom ?? balance.denom,
      img: denomInfo?.icon,
      ibcDenom: '',
      usdPrice,
      coinDecimals: denomInfo?.coinDecimals,
      coinGeckoId: denomInfo?.coinGeckoId,
      tokenBalanceOnChain: chain as SupportedChain,
    };

    return formattedBalance;
  }

  private filterDisplayCW20Tokens(tokens: Token[], chain: SupportedChain) {
    const cw20DenomAddresses = this.getCW20DenomAddresses(chain);
    const disabledCW20Tokens = this.disabledCW20DenomsStore.getDisabledCW20DenomsForChain(chain);
    const enabledCW20Tokens = this.enabledCW20DenomsStore.getEnabledCW20DenomsForChain(chain);
    return tokens.filter((token) =>
      cw20DenomAddresses.includes(token.coinMinimalDenom) && String(token.amount) === '0'
        ? enabledCW20Tokens.includes(token.coinMinimalDenom)
        : !disabledCW20Tokens.includes(token.coinMinimalDenom),
    );
  }

  get cw20Tokens() {
    const activeChain = this.activeChainStore.activeChain;
    if (activeChain === 'aggregated') {
      return sortTokenBalances(this.allCW20Tokens);
    }

    const balanceKey = this.getBalanceKey(activeChain);
    const cw20Tokens = this.filterDisplayCW20Tokens(
      Object.values(this.chainWiseBalances[balanceKey] ?? {}),
      activeChain,
    );
    return sortTokenBalances(cw20Tokens);
  }

  get allCW20Tokens() {
    let allTokens: Token[] = [];
    const chains = Object.keys(this.chainInfosStore?.chainInfos);

    chains.forEach((chain) => {
      const balanceKey = this.getBalanceKey(chain as SupportedChain);
      const cw20Tokens = this.filterDisplayCW20Tokens(
        Object.values(this.chainWiseBalances[balanceKey] ?? {}),
        chain as SupportedChain,
      );
      allTokens = allTokens.concat(cw20Tokens);
    });

    return sortTokenBalances(allTokens);
  }

  getCW20TokensForChain = computedFn((chain: SupportedChain) => {
    const balanceKey = this.getBalanceKey(chain);
    const cw20Tokens = this.filterDisplayCW20Tokens(Object.values(this.chainWiseBalances[balanceKey] ?? {}), chain);
    return sortTokenBalances(cw20Tokens ?? []);
  });

  getLoadingStatusForChain = computedFn((chain: SupportedChain) => {
    const balanceKey = this.getBalanceKey(chain);
    return this.chainWiseLoadingStatus[balanceKey] ?? true;
  });

  get loading() {
    const activeChain = this.activeChainStore.activeChain;
    if (activeChain === 'aggregated') {
      return this.aggregatedLoadingStatus;
    }

    const balanceKey = this.getBalanceKey(activeChain);
    return this.chainWiseLoadingStatus[balanceKey] ?? true;
  }
}
