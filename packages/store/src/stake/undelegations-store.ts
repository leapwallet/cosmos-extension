import {
  Amount,
  axiosWrapper,
  fromSmall,
  isAptosChain,
  NativeDenom,
  pubKeyToEvmAddressToShow,
  SupportedChain,
  UnbondingDelegation,
  UnbondingDelegationEntry,
  UnbondingDelegationResponse,
} from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { AggregatedChainsStore, ChainInfosConfigStore, ChainInfosStore, DenomsStore, NmsStore } from '../assets';
import { PriceStore } from '../bank';
import {
  AggregatedSupportedChainType,
  ChainInfosConfigType,
  ChainUndelegations,
  LoadingStatusType,
  SelectedNetworkType,
  Undelegations,
} from '../types';
import { formatTokenAmount, isFeatureExistForChain } from '../utils';
import { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';
import { StakingApiStore, UndelegationsAPIRequest } from './staking-api-store';
import { ActiveStakingDenomStore } from './utils-store';

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
  stakingApiStore: StakingApiStore;

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
    stakingApiStore: StakingApiStore,
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
    this.stakingApiStore = stakingApiStore;
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
      this.fetchUndelegations(
        this.aggregatedChainsStore.aggregatedChainsData as SupportedChain[],
        network ?? 'mainnet',
        forceRefetch,
      );
    } else {
      const chainKey = this.getChainKey(chain);

      if (!this.chainWiseUndelegations[chainKey] || forceRefetch) {
        this.fetchUndelegations([chain], network, forceRefetch);
      }
    }
  }

  async fetchUndelegations(chainsList: SupportedChain[], network: SelectedNetworkType, forceRefetch = false) {
    const isTestnet = network === 'testnet';
    const request: UndelegationsAPIRequest = {
      chains: {},
      forceRefetch,
    };

    chainsList.forEach((chain) => {
      const address = this.addressStore.addresses?.[chain];
      const activeChainInfo = this.chainInfosStore.chainInfos[chain as SupportedChain];
      const activeChainId = isTestnet ? activeChainInfo?.testnetChainId : activeChainInfo?.chainId;
      if (!activeChainId || !address || activeChainInfo?.evmOnlyChain || isAptosChain(chain)) return;
      const chainKey = this.getChainKey(chain as SupportedChain);
      runInAction(() => {
        this.chainWiseStatus[chainKey] = 'loading';
      });

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

      if (isFeatureComingSoon || isFeatureNotSupported) {
        runInAction(() => {
          this.chainWiseStatus[chainKey] = 'success';
          this.chainWiseUndelegations[chainKey] = {};
        });
        return;
      }

      runInAction(() => {
        this.chainWiseRefetch[chainKey] = async () => {
          await this.fetchUndelegations([chain], this.selectedNetworkStore.selectedNetwork, true);
        };
      });

      request.chains[activeChainId] = {
        address,
        denom: this.activeStakingDenomStore.stakingDenomForChain(chain)?.[0].coinMinimalDenom,
      };
    });

    const { chains, errors } = await this.stakingApiStore.getUndelegations(request);
    chainsList.forEach(async (chain) => {
      const address = this.addressStore.addresses?.[chain];
      const activeChainInfo = this.chainInfosStore.chainInfos[chain as SupportedChain];
      const activeChainId = isTestnet ? activeChainInfo?.testnetChainId : activeChainInfo?.chainId;
      const chainKey = this.getChainKey(chain);
      const activeStakingDenom = this.activeStakingDenomStore.stakingDenomForChain(chain as SupportedChain)?.[0];

      try {
        if (!activeChainId || !address || activeChainInfo?.evmOnlyChain || isAptosChain(chain)) {
          throw new Error('Missing details or stake is not supported');
        }
        let unbonding_responses: UnbondingDelegation[] = [];
        const hasError = errors && errors.some((item) => item.chainId === activeChainInfo.chainId);
        if (hasError) {
          const nodeUrlKey = isTestnet ? 'restTest' : 'rest';
          const hasEntryInNms =
            this.nmsStore.restEndpoints[activeChainId] && this.nmsStore.restEndpoints[activeChainId].length > 0;

          const lcdUrl = hasEntryInNms
            ? this.nmsStore.restEndpoints[activeChainId][0].nodeUrl
            : activeChainInfo?.apis[nodeUrlKey];

          const res = await axiosWrapper({
            baseURL: lcdUrl,
            method: 'get',
            url:
              (['initia', 'initiaEvm'].includes(chain)
                ? '/initia/mstaking/v1/delegators/'
                : '/cosmos/staking/v1beta1/delegators/') +
              address +
              '/unbonding_delegations',
          });

          unbonding_responses = (res.data as UnbondingDelegationResponse).unbonding_responses;
        } else {
          unbonding_responses = Object.values(chains[activeChainInfo.chainId]).filter(
            (item) => typeof item !== 'number',
          ) as UnbondingDelegation[];
        }

        const unDelegations = await this.formatUndelegations(unbonding_responses, chain, activeStakingDenom, !hasError);

        runInAction(() => {
          this.chainWiseUndelegations[chainKey] = unDelegations;
          this.chainWiseStatus[chainKey] = 'success';
        });
      } catch (error) {
        runInAction(() => {
          this.chainWiseUndelegations[chainKey] = {};
          this.chainWiseStatus[chainKey] = 'error';
        });
      }
    });
  }

  async formatUndelegations(
    unbonding_responses: UnbondingDelegation[],
    activeChain: SupportedChain,
    activeStakingDenom: NativeDenom,
    isFormatted: boolean,
  ) {
    await this.waitForPriceStore();
    const coingeckoPrices = this.priceStore.data;

    const activeChainInfo = this.chainInfosStore.chainInfos[activeChain];

    if (['initia', 'initiaEvm'].includes(activeChain)) {
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

    if (!isFormatted) {
      unbonding_responses.map((r) => {
        r.entries.map((e) => {
          e.balance = fromSmall(e.balance, activeStakingDenom?.coinDecimals ?? 6);
          e.initial_balance = fromSmall(e.initial_balance, activeStakingDenom?.coinDecimals ?? 6);
          return e;
        });
        return r;
      });
    }

    let denomFiatValue: string | undefined = undefined;
    if (activeStakingDenom?.coinGeckoId) {
      if (coingeckoPrices) {
        let tokenPrice;
        const coinGeckoId = activeStakingDenom?.coinGeckoId;
        const alternateCoingeckoKey = `${activeChainInfo.chainId}-${activeStakingDenom?.coinMinimalDenom}`;

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
    const evmPubKey = this.addressStore?.pubKeys?.ethereum;
    const cosmosAddress = this.addressStore?.addresses?.cosmos;
    const evmAddress = evmPubKey ? pubKeyToEvmAddressToShow(evmPubKey, true) : '';
    const address = cosmosAddress || evmAddress;

    const chainId =
      this.selectedNetworkStore.selectedNetwork == 'testnet'
        ? this.chainInfosStore.chainInfos[chain]?.testnetChainId
        : this.chainInfosStore.chainInfos[chain]?.chainId;

    return `${address}-${chain}-${chainId}`;
  }

  private async waitForPriceStore() {
    try {
      await this.priceStore.readyPromise;
    } catch (e) {
      //
    }
  }
}
