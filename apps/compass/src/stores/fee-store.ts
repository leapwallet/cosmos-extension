import { useIbcTraceStore } from '@leapwallet/cosmos-wallet-hooks'
import {
  AptosGasPricesStore,
  DappDefaultFeeStore,
  DefaultGasEstimatesStore,
  EvmGasPricesStore,
  FeeDenomsStore,
  FeeMarketGasPriceStepStore,
  FeeTokensStore,
  GasAdjustmentStore,
  GasPriceOptionsStore,
  GasPriceStepForChainStore,
  GasPriceStepStore,
} from '@leapwallet/cosmos-wallet-store'

import { getStorageAdapter } from '../utils/storageAdapter'
import { currencyStore } from './balance-store'
import { chainCosmosSdkStore, chainInfoStore } from './chain-infos-store'
import { chainApisStore } from './chains-api-store'
import { rootDenomsStore } from './denoms-store-instance'
import { rootBalanceStore } from './root-store'
import { transactionConfigsStore } from './transaction-configs-store'

const storageAdapter = getStorageAdapter()

export const gasAdjustmentStore = new GasAdjustmentStore(storageAdapter)

export const defaultGasEstimatesStore = new DefaultGasEstimatesStore(storageAdapter, null)

export const gasPriceStepStore = new GasPriceStepStore(storageAdapter)

export const gasPriceStepForChainStore = new GasPriceStepForChainStore(
  chainInfoStore,
  chainApisStore,
  gasPriceStepStore,
)

export const feeMarketGasPriceStepStore = new FeeMarketGasPriceStepStore(
  chainInfoStore,
  chainApisStore,
  gasPriceStepForChainStore,
)

export const evmGasPricesStore = new EvmGasPricesStore(
  chainInfoStore,
  chainApisStore,
  storageAdapter,
)

export const aptosGasPricesStore = new AptosGasPricesStore(chainInfoStore, chainApisStore)

export const dappDefaultFeeStore = new DappDefaultFeeStore()

export const feeDenomsStore = new FeeDenomsStore(chainInfoStore, storageAdapter)

export const feeTokensStore = new FeeTokensStore({
  aptosGasPricesStore,
  chainApisStore: chainApisStore,
  chainInfosStore: chainInfoStore,
  rootDenomsStore,
  rootBalanceStore,
  evmGasPricesStore,
  dappDefaultFeeStore,
  feeDenomsStore,
  gasPriceStepForChainStore,
  addIbcTraceData: useIbcTraceStore.getState().addIbcTraceData, // remove this when `useIbcTraceStore` is migrated to mobx
  storage: storageAdapter,
})

export const gasPriceOptionsStore = new GasPriceOptionsStore({
  chainCosmosSdkStore,
  chainInfosStore: chainInfoStore,
  defaultGasEstimatesStore,
  feeTokensStore,
  rootDenomsStore,
  transactionConfigsStore,
  chainApisStore,
  aptosGasPricesStore,
  evmGasPricesStore,
  feeDenomsStore,
  gasPriceStepForChainStore,
  currencyStore,
})
