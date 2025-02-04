import { axiosWrapper, fromSmall, isAptosChain, RewardsResponse, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { AggregatedChainsStore, ChainInfosConfigStore, ChainInfosStore, NmsStore } from '../assets';
import { PriceStore } from '../bank';
import { BaseQueryStore } from '../base/base-data-store';
import {
  AggregatedSupportedChainType,
  ChainClaimRewards,
  ChainInfosConfigType,
  ClaimRewards,
  GetRewardsForChainParams,
  LoadingStatusType,
  SelectedNetworkType,
} from '../types';
import { formatTokenAmount, isFeatureExistForChain } from '../utils';
import { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';
import { ActiveStakingDenomStore, IbcDenomInfoStore } from './utils-store';

class RewardsQuery extends BaseQueryStore<RewardsResponse> {
  chain: SupportedChain;
  restUrl: string;
  address: string;

  constructor(restUrl: string, address: string, chain: SupportedChain) {
    super();
    makeObservable(this);
    this.restUrl = restUrl;
    this.address = address;
    this.chain = chain;
  }

  async fetchData() {
    const res = await axiosWrapper({
      baseURL: this.restUrl,
      method: 'get',
      url: `/cosmos/distribution/v1beta1/delegators/${this.address}/rewards`,
    });
    return res.data;
  }
}

export class ClaimRewardsStore {
  chainInfosStore: ChainInfosStore;
  addressStore: AddressStore;
  activeChainStore: ActiveChainStore;
  selectedNetworkStore: SelectedNetworkStore;
  chainInfosConfigStore: ChainInfosConfigStore;
  nmsStore: NmsStore;
  aggregatedChainsStore: AggregatedChainsStore;
  activeStakingDenomStore: ActiveStakingDenomStore;
  priceStore: PriceStore;
  ibcDenomInfoStore: IbcDenomInfoStore;

  chainWiseRewards: Record<string, ClaimRewards | Record<string, never>> = {};
  chainWiseLoading: Record<string, LoadingStatusType> = {};
  chainWiseIsFetchingRewards: Record<string, boolean> = {};
  chainWiseRefetch: Record<string, () => Promise<void>> = {};
  rewardsQueryStore: Record<string, RewardsQuery> = {};

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
    ibcDenomInfoStore: IbcDenomInfoStore,
  ) {
    makeObservable(this, {
      chainClaimRewards: computed.struct,
      rewardsQueryStore: observable.shallow,
      chainWiseRewards: observable.shallow,
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
    this.ibcDenomInfoStore = ibcDenomInfoStore;
  }

  get chainClaimRewards(): ChainClaimRewards {
    return this.claimRewardsForChain(this.activeChainStore.activeChain as SupportedChain);
  }

  claimRewardsForChain = computedFn((chain: SupportedChain): ChainClaimRewards => {
    const chainKey = this.getChainKey(chain);

    return {
      loadingRewardsStatus: this.chainWiseLoading[chainKey],
      isFetchingRewards: this.chainWiseIsFetchingRewards[chainKey],
      rewards: this.chainWiseRewards[chainKey],
      refetchDelegatorRewards: this.chainWiseRefetch[chainKey],
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

    if (this.addressStore.addresses) {
      this.loadClaimRewards();
    }
  }

  async loadClaimRewards(chain?: AggregatedSupportedChainType, network?: SelectedNetworkType, forceRefetch = false) {
    chain = chain || this.activeChainStore.activeChain;
    network = network || this.selectedNetworkStore.selectedNetwork;

    if (chain === 'aggregated') {
      this.aggregatedChainsStore.aggregatedChainsData.forEach((chain) => {
        const chainKey = this.getChainKey(chain as SupportedChain);

        if (!this.chainWiseRewards[chainKey] || forceRefetch) {
          runInAction(() => (this.chainWiseLoading[chainKey] = 'loading'));
          this.fetchChainRewards(chain as SupportedChain, network ?? 'mainnet');
        }
      });
    } else {
      const chainKey = this.getChainKey(chain);

      if (!this.chainWiseRewards[chainKey] || forceRefetch) {
        this.chainWiseLoading[chainKey] = 'loading';
        this.fetchChainRewards(chain, network);
      }
    }
  }

  async fetchChainRewards(chain: SupportedChain, network: SelectedNetworkType) {
    const isTestnet = network === 'testnet';
    const address = this.addressStore.addresses?.[chain];

    const activeChainInfo = this.chainInfosStore.chainInfos[chain];
    const activeChainId = isTestnet ? activeChainInfo?.testnetChainId : activeChainInfo?.chainId;

    if (!activeChainId || !address || activeChainInfo?.evmOnlyChain || isAptosChain(chain)) return;
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
        this.chainWiseIsFetchingRewards[chainKey] = true;

        await this.fetchChainRewards(
          this.activeChainStore.activeChain as SupportedChain,
          this.selectedNetworkStore.selectedNetwork,
        );

        this.chainWiseIsFetchingRewards[chainKey] = false;
      };
    });

    if (isFeatureComingSoon || isFeatureNotSupported) {
      runInAction(() => {
        this.chainWiseRewards[chainKey] = {};
        this.chainWiseLoading[chainKey] = 'success';
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
      const response = await this.getRewardsForChain({
        lcdUrl: lcdUrl ?? '',
        address,
        chainId: activeChainId,
        chainKey,
        activeChain: chain as SupportedChain,
        selectedNetwork: network,
      });

      if (response) {
        const { claimTotal, totalRewardsDollarAmt, _rewards } = response;
        const rewards = _rewards.reduce((a: any, v: any) => {
          return Object.assign(a, { [v.validator_address]: v });
        }, {});

        const totalRewards = await Promise.all(
          _rewards.map((_reward) => {
            const reward = _reward?.reward.map((claim) => {
              const { amount: _amount, denom } = claim;
              const denomInfo = claimTotal.find((token) => token.denom === denom);
              const amount = fromSmall(_amount, denomInfo?.tokenInfo?.coinDecimals ?? 6);

              const denomFiatValue = denomInfo?.denomFiatValue ?? '0';
              const currencyAmount = new BigNumber(amount).multipliedBy(denomFiatValue).toString();

              let formatted_amount = '';
              if (denomInfo && denomInfo.tokenInfo) {
                const tokenInfo = denomInfo.tokenInfo;
                formatted_amount = formatTokenAmount(amount, tokenInfo.coinDenom, tokenInfo.coinDecimals);

                if (formatted_amount === 'NaN') {
                  formatted_amount = '0 ' + tokenInfo.coinDenom;
                }
              }

              return Object.assign(claim, {
                amount,
                currencyAmount,
                formatted_amount,
                tokenInfo: denomInfo?.tokenInfo,
              });
            });

            return Object.assign(_reward, reward);
          }),
        );

        const totalRewardsAmt = claimTotal
          .reduce((a, v) => {
            return a + +v.amount;
          }, 0)
          .toString();

        const activeStakingDenom = this.activeStakingDenomStore.stakingDenomForChain(chain)?.[0];
        let formattedTotalRewardsAmt = formatTokenAmount(totalRewardsAmt, activeStakingDenom.coinDenom, 4);
        if (formattedTotalRewardsAmt === 'NaN') {
          formattedTotalRewardsAmt = '0 ' + activeStakingDenom.coinDenom;
        }

        runInAction(() => {
          this.chainWiseLoading[chainKey] = 'success';
          this.chainWiseRewards[chainKey] = {
            rewards,
            result: { rewards: totalRewards, total: claimTotal },
            totalRewards: totalRewardsAmt,
            formattedTotalRewards: formattedTotalRewardsAmt,
            totalRewardsDollarAmt,
          };
        });
      } else {
        runInAction(() => {
          this.chainWiseRewards[chainKey] = {};
          this.chainWiseLoading[chainKey] = 'success';
        });
      }
    } catch (_) {
      runInAction(() => {
        this.chainWiseLoading[chainKey] = 'error';
        this.chainWiseRewards[chainKey] = {};
      });
    }
  }

  async getRewardsForChain({
    lcdUrl,
    address,
    chainId,
    activeChain,
    chainKey,
    selectedNetwork,
  }: GetRewardsForChainParams) {
    if (!this.rewardsQueryStore[chainKey]) {
      this.rewardsQueryStore[chainKey] = new RewardsQuery(lcdUrl, address, activeChain);
    }
    const res = await this.rewardsQueryStore[chainKey].fetchData();

    const { total, rewards: _rewards } = res as RewardsResponse;

    const claimTotal = await Promise.all(
      total.map(async (claim) => {
        const { amount: _amount, denom } = claim;
        let { denomInfo } = await this.ibcDenomInfoStore.ibcDenomInfoForChain(activeChain, selectedNetwork, denom);
        if (!denomInfo) {
          denomInfo = this.activeStakingDenomStore?.activeStakingDenom?.find((d) => d?.coinMinimalDenom === denom);
        }
        const amount = fromSmall(_amount, denomInfo?.coinDecimals ?? 6);

        let denomFiatValue = '0';
        const coingeckoPrices = this.priceStore.data;

        if (denomInfo?.coinGeckoId) {
          if (coingeckoPrices) {
            let tokenPrice;
            const coinGeckoId = denomInfo?.coinGeckoId;
            const alternateCoingeckoKey = `${chainId}-${denomInfo?.coinMinimalDenom}`;

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

        const currencyAmount = new BigNumber(amount).multipliedBy(denomFiatValue).toString();

        let formatted_amount = '';
        if (denomInfo) {
          formatted_amount = formatTokenAmount(amount, denomInfo.coinDenom, denomInfo.coinDecimals);

          if (formatted_amount === 'NaN') {
            formatted_amount = '0 ' + denomInfo.coinDenom;
          }
        }

        return Object.assign(claim, {
          amount,
          currencyAmount,
          formatted_amount,
          tokenInfo: denomInfo,
          denomFiatValue,
        });
      }),
    );

    let totalRewardsDollarAmt = '0';
    if (claimTotal[0]) {
      totalRewardsDollarAmt = claimTotal
        .reduce((totalSum, token) => {
          return totalSum.plus(new BigNumber(token.currencyAmount ?? ''));
        }, new BigNumber('0'))
        .toString();
    }

    return {
      totalRewardsDollarAmt,
      claimTotal,
      _rewards,
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
