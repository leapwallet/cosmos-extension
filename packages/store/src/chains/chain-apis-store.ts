import { getChainApis, isAptosChain, NetworkType, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';

import { ChainInfosStore } from '../assets';
import { ApiAvailabilityStore } from './api-availability-store';

// replaces useChainApis from useRpcUrl
export class ChainApisStore {
  private chainInfoStore: ChainInfosStore;
  private apiAvailabilityStore: ApiAvailabilityStore;

  constructor(chainInfoStore: ChainInfosStore, apiAvailabilityStore: ApiAvailabilityStore) {
    this.chainInfoStore = chainInfoStore;
    this.apiAvailabilityStore = apiAvailabilityStore;
  }

  private getActiveChainInfo(activeChain: SupportedChain) {
    return this.chainInfoStore.chainInfos[activeChain];
  }

  private async isTestNetRpcAvailable(activeChain: SupportedChain, activeNetwork: NetworkType) {
    if (activeNetwork !== 'testnet' || isAptosChain(activeChain)) {
      return true;
    }

    const rpcTest = this.getActiveChainInfo(activeChain)?.apis?.rpcTest;
    if (!rpcTest) {
      return false;
    }

    return this.apiAvailabilityStore.getStatus(rpcTest);
  }

  async getChainApis(activeChain: SupportedChain, activeNetwork: NetworkType) {
    return getChainApis(
      activeChain,
      activeNetwork,
      this.chainInfoStore.chainInfos,
      (await this.isTestNetRpcAvailable(activeChain, activeNetwork)) || false,
    );
  }
}
