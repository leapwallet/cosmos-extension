import {
  Amount,
  axiosWrapper,
  fromSmall,
  SupportedChain,
  UnbondingDelegation,
  UnbondingDelegationEntry,
  UnbondingDelegationResponse,
} from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';
import { computed, makeAutoObservable, makeObservable, observable, reaction, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { AggregatedChainsStore, ChainInfosConfigStore, ChainInfosStore, DenomsStore, NmsStore } from '../assets';
import { PriceStore } from '../bank';
import {
  AggregatedSupportedChainType,
  ChainInfosConfigType,
  ChainUndelegations,
  GetDelegationsForChainParams,
  LoadingStatusType,
  SelectedNetworkType,
  Undelegations,
} from '../types';
import { formatTokenAmount, isFeatureExistForChain } from '../utils';
import { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';
import { ActiveStakingDenomStore } from './index';

export class UndelegationsStore {
  chainInfosStore: ChainInfosStore;
  addressStore: AddressStore;
  activeChainStore: ActiveChainStore;
  selectedNetworkStore: SelectedNetworkStore;
  chainInfosConfigStore: ChainInfosConfigStore;
  denomsStore: DenomsStore;
  nmsStore: NmsStore;
  aggregatedChainsStore: AggregatedChainsStore;
  activeStakingDenomStore: ActiveStakingDenomStore;
  priceStore: PriceStore;

  chainWiseUndelegations: Record<string, Undelegations> = {};
  chainWiseStatus: Record<string, LoadingStatusType> = {};
  chainWiseRefetch: Record<string, () => Promise<void>> = {};

  constructor(
    chainInfosStore: ChainInfosStore,
    addressStore: AddressStore,
    activeChainStore: ActiveChainStore,
    selectedNetworkStore: SelectedNetworkStore,
    chainInfosConfigStore: ChainInfosConfigStore,
    denomsStore: DenomsStore,
    nmsStore: NmsStore,
    aggregatedChainsStore: AggregatedChainsStore,
    activeStakingDenomStore: ActiveStakingDenomStore,
    priceStore: PriceStore,
  ) {
    makeObservable(this, {
      chainUndelegations: computed.struct,
      chainWiseUndelegations: observable.shallow,
      chainWiseStatus: observable,
      chainWiseRefetch: observable.shallow,
    });

    this.chainInfosStore = chainInfosStore;
    this.addressStore = addressStore;
    this.activeChainStore = activeChainStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.chainInfosConfigStore = chainInfosConfigStore;
    this.denomsStore = denomsStore;
    this.nmsStore = nmsStore;
    this.aggregatedChainsStore = aggregatedChainsStore;
    this.activeStakingDenomStore = activeStakingDenomStore;
    this.priceStore = priceStore;
  }

  async initialize() {
    await Promise.all([
      this.addressStore.readyPromise,
      this.activeChainStore.readyPromise,
      this.selectedNetworkStore.readyPromise,
      this.chainInfosConfigStore.readyPromise,
      this.denomsStore.readyPromise,
      this.nmsStore.readyPromise,
      this.aggregatedChainsStore.readyPromise,
      this.priceStore.readyPromise,
    ]);

    this.loadUndelegations();
  }

  get chainUndelegations(): ChainUndelegations {
    return this.unDelegationsForChain(this.activeChainStore.activeChain as SupportedChain);
  }

  unDelegationsForChain = computedFn((chain: SupportedChain): ChainUndelegations => {
    const chainKey = this.getChainKey(chain);

    return {
      unboundingDelegationsInfo: this.chainWiseUndelegations[chainKey] ?? {},
      loadingUnboundingDegStatus: this.chainWiseStatus[chainKey] ?? 'loading',
      refetchUnboundingDelegations:
        this.chainWiseRefetch[chainKey] ??
        async function () {
          await Promise.resolve();
        },
    };
  });

  async loadUndelegations(chain?: AggregatedSupportedChainType, network?: SelectedNetworkType, forceRefetch = false) {
    chain = chain || this.activeChainStore.activeChain;
    network = network || this.selectedNetworkStore.selectedNetwork;

    if (chain === 'aggregated') {
      this.aggregatedChainsStore.aggregatedChainsData.forEach((chain) => {
        const chainKey = this.getChainKey(chain as SupportedChain);

        if (!this.chainWiseUndelegations[chainKey] || forceRefetch) {
          runInAction(() => (this.chainWiseStatus[chainKey] = 'loading'));
          this.fetchChainUndelegations(chain as SupportedChain, network ?? 'mainnet');
        }
      });
    } else {
      const chainKey = this.getChainKey(chain);

      if (!this.chainWiseUndelegations[chainKey] || forceRefetch) {
        runInAction(() => (this.chainWiseStatus[chainKey] = 'loading'));
        this.fetchChainUndelegations(chain, network);
      }
    }
  }

  async fetchChainUndelegations(chain: SupportedChain, network: SelectedNetworkType) {
    const isTestnet = network === 'testnet';
    const address = this.addressStore.addresses?.[chain];

    const activeChainInfo = this.chainInfosStore.chainInfos[chain];
    const activeChainId = isTestnet ? activeChainInfo?.testnetChainId : activeChainInfo?.chainId;

    if (!activeChainId || !address || activeChainInfo?.evmOnlyChain) return;
    const chainKey = this.getChainKey(chain);

    const isFeatureComingSoon = isFeatureExistForChain(
      'comingSoon',
      'stake',
      'Extension',
      activeChainId,
      this.chainInfosConfigStore.chainInfosConfig as ChainInfosConfigType,
    );

    const isFeatureNotSupported = isFeatureExistForChain(
      'notSupported',
      'stake',
      'Extension',
      activeChainId,
      this.chainInfosConfigStore.chainInfosConfig as ChainInfosConfigType,
    );

    runInAction(() => {
      this.chainWiseRefetch[chainKey] = async () => {
        await this.fetchChainUndelegations(chain, this.selectedNetworkStore.selectedNetwork);
      };
    });

    if (isFeatureComingSoon || isFeatureNotSupported) {
      this.chainWiseUndelegations[chainKey] = {};
      runInAction(() => (this.chainWiseStatus[chainKey] = 'success'));
      return;
    }

    const nodeUrlKey = isTestnet ? 'restTest' : 'rest';
    const hasEntryInNms =
      this.nmsStore.restEndpoints[activeChainId] && this.nmsStore.restEndpoints[activeChainId].length > 0;

    const lcdUrl = hasEntryInNms
      ? this.nmsStore.restEndpoints[activeChainId][0].nodeUrl
      : activeChainInfo?.apis[nodeUrlKey];

    try {
      const uDelegations = await this.getUndelegationsForChain({
        lcdUrl: lcdUrl ?? '',
        address,
        activeStakingDenom: this.activeStakingDenomStore.stakingDenomForChain(chain)?.[0],
        chainId: activeChainId,
        activeChain: chain as SupportedChain,
      });

      runInAction(() => {
        this.chainWiseUndelegations[chainKey] = uDelegations;
        this.chainWiseStatus[chainKey] = 'success';
      });
    } catch (_) {
      runInAction(() => {
        this.chainWiseUndelegations[chainKey] = {};
        this.chainWiseStatus[chainKey] = 'error';
      });
    }
  }

  async getUndelegationsForChain({
    lcdUrl,
    address,
    activeStakingDenom,
    chainId,
    activeChain,
  }: GetDelegationsForChainParams) {
    const res = await axiosWrapper({
      baseURL: lcdUrl,
      method: 'get',
      url:
        (activeChain === 'initia' ? '/initia/mstaking/v1/delegators/' : '/cosmos/staking/v1beta1/delegators/') +
        address +
        '/unbonding_delegations',
    });

    const denoms = this.denomsStore.denoms;
    const coingeckoPrices = this.priceStore.data;

    const activeChainInfo = this.chainInfosStore.chainInfos[activeChain];
    const denom = denoms[Object.keys(activeChainInfo?.nativeDenoms ?? {})?.[0] ?? ''];

    let denomFiatValue: string | undefined = undefined;
    if (denom?.coinGeckoId) {
      if (coingeckoPrices) {
        let tokenPrice;
        const coinGeckoId = denom?.coinGeckoId;
        const alternateCoingeckoKey = `${chainId}-${denom?.coinMinimalDenom}`;

        if (coinGeckoId) {
          tokenPrice = coingeckoPrices[coinGeckoId];
        }

        if (!tokenPrice) {
          tokenPrice = coingeckoPrices[alternateCoingeckoKey];
        }

        if (tokenPrice) {
          denomFiatValue = new BigNumber('1').times(tokenPrice).toString();
        }
      }
    }

    let { unbonding_responses } = res.data as UnbondingDelegationResponse;

    if (activeChain === 'initia') {
      unbonding_responses = unbonding_responses.map((unDelegation: UnbondingDelegation) => {
        const entries = unDelegation.entries.reduce(
          (acc: UnbondingDelegationEntry[], entry: UnbondingDelegationEntry) => {
            const balance = (entry.balance as unknown as Amount[]).find(
              (balance) => balance.denom === activeStakingDenom?.coinMinimalDenom,
            );

            const initialBalance = (entry.initial_balance as unknown as Amount[]).find(
              (balance) => balance.denom === activeStakingDenom?.coinMinimalDenom,
            );

            if (balance && initialBalance) {
              return [
                ...acc,
                {
                  ...entry,
                  balance: balance.amount,
                  initial_balance: initialBalance.amount,
                },
              ];
            }

            return acc;
          },
          [],
        );

        return {
          ...unDelegation,
          entries,
        };
      });
    }

    unbonding_responses.map((r) => {
      r.entries.map((e) => {
        e.balance = fromSmall(e.balance, denom?.coinDecimals ?? 6);
        e.initial_balance = fromSmall(e.initial_balance, denom?.coinDecimals ?? 6);
        return e;
      });
      return r;
    });

    const uDelegations: Record<string, UnbondingDelegation> = unbonding_responses.reduce(
      (a, v) => ({ ...a, [v.validator_address]: v }),
      {},
    );

    Object.values(uDelegations).map(async (r) => {
      r.entries.map((e) => {
        e.formattedBalance = formatTokenAmount(e.balance, activeStakingDenom?.coinDenom, 6);
        e.currencyBalance = new BigNumber(e.balance).multipliedBy(denomFiatValue ?? '0').toString();
      });
    });

    return uDelegations;
  }

  getChainKey(chain: SupportedChain) {
    const cosmosAddress = this.addressStore.addresses?.cosmos;
    const chainId =
      this.selectedNetworkStore.selectedNetwork == 'testnet'
        ? this.chainInfosStore.chainInfos[chain]?.testnetChainId
        : this.chainInfosStore.chainInfos[chain]?.chainId;

    return `${cosmosAddress}-${chain}-${chainId}`;
  }
}
