import { getChainId, getFeeMarketGasPrices, NetworkType, roundOf, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { ChainInfosStore } from 'assets';

import { ChainApisStore } from '../chains';
import { GasPriceStepForChainStore } from './get-price-step-for-chain-store';
import { GasPriceStep } from './types';

const CHAIN_SPECIFIC_FEE_MARKET_ADJUSTMENT: Record<string, number> = {
  'cheqd-testnet-6': 1e4,
  'cheqd-mainnet-1': 1e4,
};

// replaces useGetFeeMarketGasPricesSteps
export class FeeMarketGasPriceStepStore {
  private chainInfoStore: ChainInfosStore;
  private chainApisStore: ChainApisStore;
  private gasPriceStepForChainStore: GasPriceStepForChainStore;

  constructor(
    chainInfoStore: ChainInfosStore,
    chainApisStore: ChainApisStore,
    gasPriceStepForChainStore: GasPriceStepForChainStore,
  ) {
    this.chainInfoStore = chainInfoStore;
    this.chainApisStore = chainApisStore;
    this.gasPriceStepForChainStore = gasPriceStepForChainStore;
  }

  async getFeeMarketGasPricesSteps(params: {
    chain: SupportedChain;
    network: NetworkType;
    feeDenom: string;
    forceBaseGasPriceStep?: GasPriceStep;
    isEvm?: boolean;
  }) {
    const { feeDenom, forceBaseGasPriceStep, isEvm } = params;
    const activeChain = params.chain;
    const activeNetwork = params.network;

    const { lcdUrl } = await this.chainApisStore.getChainApis(activeChain, activeNetwork);
    const feeMarketData = await getFeeMarketGasPrices(lcdUrl ?? '');
    const feeMarketDenomData = feeMarketData.find(({ denom }) => denom === feeDenom);

    const chainId = getChainId(this.chainInfoStore.chainInfos[activeChain], activeNetwork, isEvm);
    const chainFeeMarketAdjustment = CHAIN_SPECIFIC_FEE_MARKET_ADJUSTMENT[chainId ?? ''] ?? 1;

    if (!feeMarketDenomData) {
      return forceBaseGasPriceStep || this.gasPriceStepForChainStore.getGasPriceSteps(activeChain, activeNetwork);
    }

    const minGasPrice = roundOf(Number(feeMarketDenomData.amount) * chainFeeMarketAdjustment, 4);

    const low = minGasPrice * 1.1;
    const medium = minGasPrice * 1.2;
    const high = minGasPrice * 1.3;

    return {
      low: roundOf(low, 5),
      medium: roundOf(medium, 5),
      high: roundOf(high, 5),
    };
  }
}
