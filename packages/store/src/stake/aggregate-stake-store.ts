import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { BigNumber } from 'bignumber.js';
import { makeAutoObservable } from 'mobx';

import { AggregatedChainsStore, ChainInfosConfigStore, ChainInfosStore } from '../assets';
import { ChainInfosConfigType } from '../types';
import { isFeatureExistForChain } from '../utils';
import { AddressStore, SelectedNetworkStore } from '../wallet';
import { ClaimRewardsStore } from './claim-rewards-store';
import { DelegationsStore } from './delegations-store';
import { ActiveStakingDenomStore } from './utils-store';
import { ValidatorsStore } from './validators-store';

export class AggregateStakeStore {
  chainInfosStore: ChainInfosStore;
  addressStore: AddressStore;
  selectedNetworkStore: SelectedNetworkStore;
  aggregatedChainsStore: AggregatedChainsStore;
  activeStakingDenomStore: ActiveStakingDenomStore;
  delegationsStore: DelegationsStore;
  validatorsStore: ValidatorsStore;
  claimRewardsStore: ClaimRewardsStore;
  chainInfosConfigStore: ChainInfosConfigStore;

  constructor(
    chainInfosStore: ChainInfosStore,
    addressStore: AddressStore,
    selectedNetworkStore: SelectedNetworkStore,
    aggregatedChainsStore: AggregatedChainsStore,
    activeStakingDenomStore: ActiveStakingDenomStore,
    delegationsStore: DelegationsStore,
    validatorsStore: ValidatorsStore,
    claimRewardsStore: ClaimRewardsStore,
    chainInfosConfigStore: ChainInfosConfigStore,
  ) {
    makeAutoObservable(this);

    this.chainInfosStore = chainInfosStore;
    this.addressStore = addressStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.aggregatedChainsStore = aggregatedChainsStore;
    this.activeStakingDenomStore = activeStakingDenomStore;
    this.delegationsStore = delegationsStore;
    this.validatorsStore = validatorsStore;
    this.claimRewardsStore = claimRewardsStore;
    this.chainInfosConfigStore = chainInfosConfigStore;
  }

  get aggregatedStake() {
    let perChainDelegations: { [key: string]: any } = {};
    const aggregatedChains = this.aggregatedChainsStore.aggregatedChainsData;

    for (const chain of aggregatedChains) {
      const activeChainInfo = this.chainInfosStore.chainInfos[chain as SupportedChain];
      const activeChainId =
        this.selectedNetworkStore.selectedNetwork == 'testnet'
          ? activeChainInfo?.testnetChainId
          : activeChainInfo?.chainId;

      const isStakeComingSoon = isFeatureExistForChain(
        'comingSoon',
        'stake',
        'Extension',
        activeChainId,
        this.chainInfosConfigStore.chainInfosConfig as ChainInfosConfigType,
      );

      const isStakeNotSupported = isFeatureExistForChain(
        'notSupported',
        'stake',
        'Extension',
        activeChainId,
        this.chainInfosConfigStore.chainInfosConfig as ChainInfosConfigType,
      );

      const isEvmChain = activeChainInfo?.evmOnlyChain;

      // If stake is coming soon or not supported for a chain then don't include it
      if (isStakeComingSoon || isStakeNotSupported || isEvmChain) {
        continue;
      }

      const chainKey = this.getChainKey(chain as SupportedChain);
      const loading = this.delegationsStore.chainWiseLoading[chainKey];

      const totalDelegationAmount = this.delegationsStore.chainWiseDelegations[chainKey]?.totalDelegationAmount;
      const currencyAmountDelegation = this.delegationsStore.chainWiseDelegations[chainKey]?.currencyAmountDelegation;
      const totalDelegation = this.delegationsStore.chainWiseDelegations[chainKey]?.totalDelegation;

      const stakingDenom = this.activeStakingDenomStore.stakingDenomForChain(chain as SupportedChain)?.[0]?.coinDenom;

      const apr =
        this.validatorsStore.chainWiseValidators[chainKey]?.chainData?.params?.calculated_apr ??
        this.validatorsStore.chainWiseValidators[chainKey]?.chainData?.params?.estimated_apr ??
        0;

      const claimRewards = this.claimRewardsStore.chainWiseRewards[chainKey]?.totalRewardsDollarAmt;
      perChainDelegations = {
        ...perChainDelegations,
        [chain]: {
          totalDelegationAmount,
          currencyAmountDelegation,
          totalDelegation,
          stakingDenom,
          loading,
          apr,
          claimRewards,
        },
      };
    }

    const totalCurrencyAmountDelegation = Object.values(perChainDelegations).reduce(
      (acc, { currencyAmountDelegation }) => acc.plus(currencyAmountDelegation ?? new BigNumber(0)),
      new BigNumber(0),
    );

    const averageApr =
      Object.values(perChainDelegations).reduce((acc, { apr }) => acc + (apr ?? 0), 0) /
      Object.values(perChainDelegations).length;

    const isEveryChainLoading = Object.values(perChainDelegations).every((chain) => chain.loading);
    const isSomeChainLoading = Object.values(perChainDelegations).some((chain) => chain.loading);

    const totalClaimRewardsAmount = Object.values(perChainDelegations).reduce(
      (acc, { claimRewards }) => acc.plus(claimRewards ?? new BigNumber(0)),
      new BigNumber(0),
    );

    return {
      perChainDelegations,
      totalCurrencyAmountDelegation,
      averageApr,
      isEveryChainLoading,
      isSomeChainLoading,
      totalClaimRewardsAmount,
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
