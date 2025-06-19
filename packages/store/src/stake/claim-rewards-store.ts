import {
  axiosWrapper,
  fromSmall,
  isAptosChain,
  pubKeyToEvmAddressToShow,
  RewardsResponse,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
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
  LoadingStatusType,
  SelectedNetworkType,
} from '../types';
import { formatTokenAmount, isFeatureExistForChain } from '../utils';
import { ActiveChainStore, AddressStore, SelectedNetworkStore } from '../wallet';
import { ClaimRewardAPIRequest, StakingApiStore } from './staking-api-store';
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
  stakingApiStore: StakingApiStore;

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
    stakingApiStore: StakingApiStore,
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
    this.stakingApiStore = stakingApiStore;
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
      this.fetchRewards(
        this.aggregatedChainsStore.aggregatedChainsData as SupportedChain[],
        network ?? 'mainnet',
        forceRefetch,
      );
    } else {
      const chainKey = this.getChainKey(chain);

      if (!this.chainWiseRewards[chainKey] || forceRefetch) {
        this.fetchRewards([chain], network, forceRefetch);
      }
    }
  }

  async fetchRewards(chainsList: SupportedChain[], network: SelectedNetworkType, forceRefetch = false) {
    const isTestnet = network === 'testnet';
    const request: ClaimRewardAPIRequest = {
      chains: {},
      forceRefetch,
    };

    chainsList.forEach((chain) => {
      const address = this.addressStore.addresses?.[chain];

      const activeChainInfo = this.chainInfosStore.chainInfos[chain];
      const activeChainId = isTestnet ? activeChainInfo?.testnetChainId : activeChainInfo?.chainId;

      if (!activeChainId || !address || activeChainInfo?.evmOnlyChain || isAptosChain(chain)) return;
      const chainKey = this.getChainKey(chain);

      runInAction(() => {
        this.chainWiseLoading[chainKey] = 'loading';
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
          this.chainWiseRewards[chainKey] = {};
          this.chainWiseLoading[chainKey] = 'success';
        });
        return;
      }

      runInAction(() => {
        this.chainWiseRefetch[chainKey] = async () => {
          await this.fetchRewards([chain], this.selectedNetworkStore.selectedNetwork, true);
        };
      });

      request.chains[activeChainId] = {
        address,
      };
    });

    const { chains, errors } = await this.stakingApiStore.getRewards(request);

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

        let res: RewardsResponse = {
          rewards: [],
          total: [],
        };
        const hasError = errors && errors.some((item) => item.chainId === activeChainInfo.chainId);
        if (hasError) {
          const nodeUrlKey = isTestnet ? 'restTest' : 'rest';
          const hasEntryInNms =
            this.nmsStore.restEndpoints[activeChainId] && this.nmsStore.restEndpoints[activeChainId].length > 0;

          const lcdUrl = hasEntryInNms
            ? this.nmsStore.restEndpoints[activeChainId][0].nodeUrl
            : activeChainInfo?.apis[nodeUrlKey];

          const { data } = await axiosWrapper<RewardsResponse>({
            baseURL: lcdUrl,
            method: 'get',
            url: `/cosmos/distribution/v1beta1/delegators/${address}/rewards`,
          });
          res = data;
        } else {
          res = chains[activeChainId].result;
        }
        const response = await this.formatRewards(res, chain, network, !hasError);
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
                const amount = !hasError ? _amount : fromSmall(_amount, denomInfo?.tokenInfo?.coinDecimals ?? 6);

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
      } catch (error) {
        runInAction(() => {
          this.chainWiseLoading[chainKey] = 'error';
          this.chainWiseRewards[chainKey] = {};
        });
      }
    });
  }

  async formatRewards(
    res: RewardsResponse,
    activeChain: SupportedChain,
    selectedNetwork: SelectedNetworkType,
    isFormatted: boolean,
  ) {
    const activeChainInfo = this.chainInfosStore.chainInfos[activeChain];
    const { total, rewards: _rewards } = res as RewardsResponse;
    await this.waitForPriceStore();
    const claimTotal = await Promise.all(
      total.map(async (claim) => {
        const { amount: _amount, denom } = claim;
        let { denomInfo } = await this.ibcDenomInfoStore.ibcDenomInfoForChain(activeChain, selectedNetwork, denom);
        if (!denomInfo) {
          denomInfo = this.activeStakingDenomStore
            ?.stakingDenomForChain(activeChain)
            ?.find((d) => d?.coinMinimalDenom === denom);
        }
        const amount = isFormatted ? _amount : fromSmall(_amount, denomInfo?.coinDecimals ?? 6);

        let denomFiatValue = '0';
        const coingeckoPrices = this.priceStore.data;

        if (denomInfo?.coinGeckoId) {
          if (coingeckoPrices) {
            let tokenPrice;
            const coinGeckoId = denomInfo?.coinGeckoId;
            const alternateCoingeckoKey = `${activeChainInfo.chainId}-${denomInfo?.coinMinimalDenom}`;

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
