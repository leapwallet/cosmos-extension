import {
  Amount,
  axiosWrapper,
  Delegation,
  DelegationResponse,
  fromSmall,
  isAptosChain,
  NativeDenom,
  pubKeyToEvmAddressToShow,
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
  GetDelegationsForChainReturn,
  SelectedNetworkType,
} from '../types';
import { calculateTokenPriceAndValue, formatTokenAmount, isFeatureExistForChain } from '../utils';
import { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';
import { DelegationsAPIRequest, StakingApiStore } from './staking-api-store';
import { ActiveStakingDenomStore } from './utils-store';

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
  stakingApiStore: StakingApiStore;

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
    stakingApiStore: StakingApiStore,
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
    this.stakingApiStore = stakingApiStore;
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
      this.fetchDelegations(
        this.aggregatedChainsStore.aggregatedChainsData as SupportedChain[],
        network ?? 'mainnet',
        forceRefetch,
      );
    } else {
      const chainKey = this.getChainKey(chain);

      if (!this.chainWiseDelegations[chainKey] || forceRefetch) {
        this.fetchDelegations([chain], network, forceRefetch);
      }
    }
  }

  async fetchDelegations(chainsList: SupportedChain[], network: SelectedNetworkType, forceRefetch = false) {
    const isTestnet = network === 'testnet';
    const request: DelegationsAPIRequest = {
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
        this.chainWiseLoading[chainKey] = true;
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
          this.chainWiseLoading[chainKey] = false;
          this.chainWiseDelegations[chainKey] = {};
        });
        return;
      }

      runInAction(() => {
        this.chainWiseRefetch[chainKey] = async () => {
          await this.fetchDelegations([chain], this.selectedNetworkStore.selectedNetwork, true);
        };
      });

      request.chains[activeChainId] = {
        address,
        denom: this.activeStakingDenomStore.stakingDenomForChain(chain)?.[0].coinMinimalDenom,
      };
    });

    const { chains, errors } = await this.stakingApiStore.getDelegations(request);
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
        let delegation_responses: Delegation[] = [];
        const hasError = errors && errors.some((item) => item.chainId === activeChainId);
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
                ? '/initia/mstaking/v1/delegations/'
                : '/cosmos/staking/v1beta1/delegations/') + address,
          });
          delegation_responses = (res.data as DelegationResponse).delegation_responses;
        } else {
          delegation_responses = Object.values(chains[activeChainId].delegations);
        }

        const response = await this.formatDelegations(delegation_responses, chain, activeStakingDenom, !hasError);

        const { delegations, totalDelegationAmount, currencyAmountDelegation, totalDelegation, stakingDenom } =
          response;

        runInAction(() => {
          this.chainWiseLoading[chainKey] = false;
          this.chainWiseDelegations[chainKey] = {
            delegations,
            totalDelegationAmount,
            currencyAmountDelegation,
            totalDelegation,
            stakingDenom,
          };
        });
      } catch (error) {
        runInAction(() => {
          this.chainWiseLoading[chainKey] = false;
          this.chainWiseDelegations[chainKey] = {};
        });
      }
    });
  }

  async formatDelegations(
    delegation_responses: Delegation[],
    activeChain: SupportedChain,
    activeStakingDenom: NativeDenom,
    isFormatted: boolean,
  ): Promise<GetDelegationsForChainReturn> {
    await this.waitForPriceStore();
    const coingeckoPrices = this.priceStore.data;
    let denomFiatValue: string | undefined = undefined;
    const activeChainInfo = this.chainInfosStore.chainInfos[activeChain];

    if (['initia', 'initiaEvm'].includes(activeChain)) {
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

    if (!isFormatted) {
      delegation_responses.forEach((delegation) => {
        delegation.balance.amount = fromSmall(delegation.balance.amount, activeStakingDenom?.coinDecimals);
      });
    }

    const coinGeckoId = activeStakingDenom?.coinGeckoId;

    const { usdPrice } = calculateTokenPriceAndValue({
      amount: '1',
      coingeckoPrices,
      coinMinimalDenom: activeStakingDenom?.coinMinimalDenom ?? '',
      chainId: activeChainInfo.chainId,
      coinGeckoId,
    });
    if (usdPrice) {
      denomFiatValue = new BigNumber('1').times(usdPrice).toString();
    }

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
      stakingDenom: activeStakingDenom?.coinDenom,
    };
  }

  private getChainKey(chain: SupportedChain) {
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
