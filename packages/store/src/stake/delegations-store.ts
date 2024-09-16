import {
  Amount,
  axiosWrapper,
  Delegation,
  DelegationResponse,
  fromSmall,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { computed, makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { AggregatedChainsStore, ChainInfosConfigStore, ChainInfosStore, NmsStore } from '../assets';
import { PriceStore } from '../bank';
import {
  AggregatedSupportedChainType,
  ChainDelegations,
  ChainInfosConfigType,
  DelegationInfo,
  GetDelegationsForChainParams,
  GetDelegationsForChainReturn,
  SelectedNetworkType,
} from '../types';
import { formatTokenAmount, isFeatureExistForChain } from '../utils';
import { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';
import { ActiveStakingDenomStore } from './index';

export class DelegationsStore {
  chainInfosStore: ChainInfosStore;
  addressStore: AddressStore;
  activeChainStore: ActiveChainStore;
  selectedNetworkStore: SelectedNetworkStore;
  chainInfosConfigStore: ChainInfosConfigStore;
  nmsStore: NmsStore;
  aggregatedChainsStore: AggregatedChainsStore;
  activeStakingDenomStore: ActiveStakingDenomStore;
  priceStore: PriceStore;

  chainWiseDelegations: Record<string, DelegationInfo | Record<string, never>> = {};
  chainWiseLoading: Record<string, boolean> = {};
  chainWiseRefetch: Record<string, () => Promise<void>> = {};

  constructor(
    chainInfosStore: ChainInfosStore,
    addressStore: AddressStore,
    activeChainStore: ActiveChainStore,
    selectedNetworkStore: SelectedNetworkStore,
    chainInfosConfigStore: ChainInfosConfigStore,
    nmsStore: NmsStore,
    aggregatedChainsStore: AggregatedChainsStore,
    activeStakingDenomStore: ActiveStakingDenomStore,
    priceStore: PriceStore,
  ) {
    makeAutoObservable(this, {
      chainDelegations: computed,
    });

    this.chainInfosStore = chainInfosStore;
    this.addressStore = addressStore;
    this.activeChainStore = activeChainStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.chainInfosConfigStore = chainInfosConfigStore;
    this.nmsStore = nmsStore;
    this.aggregatedChainsStore = aggregatedChainsStore;
    this.activeStakingDenomStore = activeStakingDenomStore;
    this.priceStore = priceStore;
  }

  get chainDelegations(): ChainDelegations {
    return this.delegationsForChain(this.activeChainStore.activeChain as SupportedChain);
  }

  delegationsForChain = computedFn((chain: SupportedChain): ChainDelegations => {
    const chainKey = this.getChainKey(chain);

    return {
      delegationInfo: this.chainWiseDelegations[chainKey] ?? {},
      loadingDelegations: this.chainWiseLoading[chainKey] ?? true,
      refetchDelegations:
        this.chainWiseRefetch[chainKey] ??
        async function () {
          await Promise.resolve;
        },
    };
  });

  async initialize() {
    await Promise.all([
      this.addressStore.readyPromise,
      this.activeChainStore.readyPromise,
      this.selectedNetworkStore.readyPromise,
      this.chainInfosConfigStore.readyPromise,
      this.nmsStore.readyPromise,
      this.aggregatedChainsStore.readyPromise,
      this.priceStore.readyPromise,
    ]);

    this.loadDelegations();
  }

  async loadDelegations(chain?: AggregatedSupportedChainType, network?: SelectedNetworkType, forceRefetch = false) {
    chain = chain || this.activeChainStore.activeChain;
    network = network || this.selectedNetworkStore.selectedNetwork;

    if (chain === 'aggregated') {
      this.aggregatedChainsStore.aggregatedChainsData.forEach((chain) => {
        const chainKey = this.getChainKey(chain as SupportedChain);

        if (!this.chainWiseDelegations[chainKey] || forceRefetch) {
          runInAction(() => (this.chainWiseLoading[chainKey] = true));
          this.fetchChainDelegations(chain as SupportedChain, network ?? 'mainnet');
        }
      });
    } else {
      const chainKey = this.getChainKey(chain);

      if (!this.chainWiseDelegations[chainKey] || forceRefetch) {
        this.chainWiseLoading[chainKey] = true;
        this.fetchChainDelegations(chain, network);
      }
    }
  }

  async fetchChainDelegations(chain: SupportedChain, network: SelectedNetworkType) {
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
        await this.fetchChainDelegations(chain, this.selectedNetworkStore.selectedNetwork);
      };
    });

    if (isFeatureComingSoon || isFeatureNotSupported) {
      runInAction(() => {
        this.chainWiseLoading[chainKey] = false;
        this.chainWiseDelegations[chainKey] = {};
      });
      return;
    }

    const nodeUrlKey = isTestnet ? 'restTest' : 'rest';
    const hasEntryInNms =
      this.nmsStore.restEndpoints[activeChainId] && this.nmsStore.restEndpoints[activeChainId].length > 0;

    const lcdUrl = hasEntryInNms
      ? this.nmsStore.restEndpoints[activeChainId][0].nodeUrl
      : activeChainInfo?.apis[nodeUrlKey];

    try {
      const response = await this.getDelegationsForChain({
        lcdUrl: lcdUrl ?? '',
        address,
        activeStakingDenom: this.activeStakingDenomStore.stakingDenomForChain(chain)?.[0],
        chainId: activeChainId,
        activeChain: chain as SupportedChain,
      });

      if (response === undefined) {
        runInAction(() => {
          this.chainWiseLoading[chainKey] = false;
          this.chainWiseDelegations[chainKey] = {};
        });
      } else {
        const { delegations, totalDelegationAmount, currencyAmountDelegation, totalDelegation } = response;

        runInAction(() => {
          this.chainWiseLoading[chainKey] = false;
          this.chainWiseDelegations[chainKey] = {
            delegations,
            totalDelegationAmount,
            currencyAmountDelegation,
            totalDelegation,
          };
        });
      }
    } catch (_) {
      runInAction(() => {
        this.chainWiseLoading[chainKey] = false;
        this.chainWiseDelegations[chainKey] = {};
      });
    }
  }

  async getDelegationsForChain({
    lcdUrl,
    address,
    activeStakingDenom,
    chainId,
    activeChain,
  }: GetDelegationsForChainParams): Promise<GetDelegationsForChainReturn | undefined> {
    const res = await axiosWrapper({
      baseURL: lcdUrl,
      method: 'get',
      url:
        (activeChain === 'initia' ? '/initia/mstaking/v1/delegations/' : '/cosmos/staking/v1beta1/delegations/') +
        address,
    });

    const coingeckoPrices = this.priceStore.data;
    let { delegation_responses } = res.data as DelegationResponse;
    let denomFiatValue: string | undefined = undefined;

    if (activeStakingDenom?.coinGeckoId) {
      if (coingeckoPrices) {
        let tokenPrice;
        const coinGeckoId = activeStakingDenom?.coinGeckoId;
        const alternateCoingeckoKey = `${chainId}-${activeStakingDenom?.coinMinimalDenom}`;

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

    if (activeChain === 'initia') {
      delegation_responses = delegation_responses.reduce((acc: Delegation[], delegation: Delegation) => {
        const uinitDelegation = (delegation.balance as unknown as Amount[]).find(
          (balance) => balance.denom === activeStakingDenom?.coinMinimalDenom,
        );

        if (uinitDelegation) {
          acc.push({
            ...delegation,
            balance: {
              ...uinitDelegation,
            },
          });
        }

        return acc;
      }, []);
    }

    delegation_responses.forEach((delegation) => {
      delegation.balance.amount = fromSmall(delegation.balance.amount, activeStakingDenom?.coinDecimals);
    });

    const rawDelegations: Record<string, Delegation> = delegation_responses.reduce(
      (a, v) => ({ ...a, [v.delegation.validator_address]: v }),
      {},
    );

    const delegations = Object.entries(rawDelegations)
      .filter(([, d]) => new BigNumber(d.balance.amount).gt(0))
      .reduce((formattedDelegations, [validator, d]) => {
        d.balance.currencyAmount = new BigNumber(d.balance.amount).multipliedBy(denomFiatValue ?? '0').toString();
        d.balance.formatted_amount = formatTokenAmount(d.balance.amount, activeStakingDenom?.coinDenom, 6);
        return { [validator]: d, ...formattedDelegations };
      }, {});

    const tda = Object.values(rawDelegations)
      .reduce((acc, v) => acc.plus(v.balance.amount), new BigNumber(0))
      .toString();
    const totalDelegationAmount = formatTokenAmount(tda, activeStakingDenom?.coinDenom);
    const currencyAmountDelegation = new BigNumber(tda).multipliedBy(denomFiatValue ?? '0').toString();

    return {
      delegations,
      totalDelegationAmount,
      currencyAmountDelegation,
      totalDelegation: new BigNumber(tda),
    };
  }

  private getChainKey(chain: SupportedChain) {
    const cosmosAddress = this.addressStore.addresses?.cosmos;
    const chainId =
      this.selectedNetworkStore.selectedNetwork == 'testnet'
        ? this.chainInfosStore.chainInfos[chain]?.testnetChainId
        : this.chainInfosStore.chainInfos[chain]?.chainId;

    return `${cosmosAddress}-${chain}-${chainId}`;
  }
}
