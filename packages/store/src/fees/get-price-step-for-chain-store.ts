import { defaultGasPriceStep, getGasPricesSteps, NetworkType, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ChainInfosStore } from 'assets';
import { makeAutoObservable } from 'mobx';

import { ChainApisStore } from '../chains';
import { GasPriceStepStore } from './gas-price-step-store';

// replaces useGasPriceStepForChain, useLowGasPriceStep
export class GasPriceStepForChainStore {
  private chainApisStore: ChainApisStore;
  private gasPriceStepStore: GasPriceStepStore;
  private chainInfosStore: ChainInfosStore;

  constructor(chainInfosStore: ChainInfosStore, ChainApisStore: ChainApisStore, gasPriceStepStore: GasPriceStepStore) {
    this.chainInfosStore = chainInfosStore;
    this.chainApisStore = ChainApisStore;
    this.gasPriceStepStore = gasPriceStepStore;

    makeAutoObservable(this);
  }

  async getLowGasPriceStep(chain: SupportedChain, activeNetwork: NetworkType) {
    const chainInfo = this.chainInfosStore.chainInfos[chain];

    if (chainInfo && chainInfo.beta && chainInfo.gasPriceStep) {
      return chainInfo.gasPriceStep.low;
    }

    const gasPriceSteps = await this.getGasPriceSteps(chain, activeNetwork);
    return gasPriceSteps.low ?? defaultGasPriceStep.low;
  }

  async getGasPriceSteps(chain: SupportedChain, activeNetwork: NetworkType) {
    const chainInfo = this.chainInfosStore.chainInfos[chain];

    const gasData = await getGasPricesSteps({
      activeChain: chainInfo.key,
      selectedNetwork: activeNetwork,
      allChainsGasPriceSteps: this.gasPriceStepStore.gasPriceSteps,
      chains: this.chainInfosStore.chainInfos,
      lcdUrl: (await this.chainApisStore.getChainApis(chain, activeNetwork)).lcdUrl,
    });

    if (chainInfo.beta && chainInfo.gasPriceStep) {
      return {
        low: chainInfo.gasPriceStep?.low ?? gasData.low,
        medium: chainInfo.gasPriceStep.average ?? gasData.medium,
        high: chainInfo.gasPriceStep.high ?? gasData.high,
      };
    }

    return gasData;
  }
}
