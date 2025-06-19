import { NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { computed, makeAutoObservable } from 'mobx';

import { ChainInfosStore, DenomsStore, StakingDenomsStore } from '../../assets';
import { ActiveChainStore, SelectedNetworkStore } from '../../wallet';

export class ActiveStakingDenomStore {
  activeChainStore: ActiveChainStore;
  selectedNetworkStore: SelectedNetworkStore;
  stakingDenomsStore: StakingDenomsStore;
  chainInfosStore: ChainInfosStore;
  denomsStore: DenomsStore;

  constructor(
    activeChainStore: ActiveChainStore,
    selectedNetworkStore: SelectedNetworkStore,
    stakingDenomsStore: StakingDenomsStore,
    chainInfosStore: ChainInfosStore,
    denomStore: DenomsStore,
  ) {
    makeAutoObservable(this, {
      activeStakingDenom: computed,
    });

    this.activeChainStore = activeChainStore;
    this.selectedNetworkStore = selectedNetworkStore;
    this.stakingDenomsStore = stakingDenomsStore;
    this.chainInfosStore = chainInfosStore;
    this.denomsStore = denomStore;
  }

  get activeStakingDenom() {
    return this.stakingDenomForChain(this.activeChainStore.activeChain as SupportedChain);
  }

  stakingDenomForChain(chain: SupportedChain) {
    const denoms = this.denomsStore.denoms;
    const activeChainInfo = this.chainInfosStore.chainInfos[chain];
    const activeStakingDenoms =
      this.stakingDenomsStore.stakingDenoms?.[this.selectedNetworkStore.selectedNetwork]?.[chain as SupportedChain];

    if (!activeStakingDenoms) {
      let nativeDenom = Object.values(activeChainInfo.nativeDenoms)[0] as NativeDenom;
      nativeDenom = {
        ...nativeDenom,
        coinGeckoId: nativeDenom.coinGeckoId ?? '',
        icon: nativeDenom.icon ?? '',
      };

      let denomKey = nativeDenom.coinMinimalDenom;
      if (chain === 'babylon' && denomKey === 'ubbn') {
        denomKey = 'tubbn';
      }

      const activeStakingDenom = denoms[denomKey] ?? nativeDenom;
      return [activeStakingDenom];
    }

    return activeStakingDenoms.reduce((acc: NativeDenom[], curr: string) => {
      if (denoms[curr]) {
        return acc.concat(denoms[curr]);
      }

      return acc;
    }, []);
  }
}
