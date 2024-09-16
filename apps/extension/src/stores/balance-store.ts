import {
  AggregatedChainsStore,
  BalanceStore,
  CompassSeiEvmConfigStore,
  CurrencyStore,
  CW20DenomBalanceStore,
  ERC20DenomBalanceStore,
  EvmBalanceStore,
  IbcTraceFetcher,
  NmsStore,
  PriceStore,
} from '@leapwallet/cosmos-wallet-store'

import { getStorageAdapter } from '../utils/storageAdapter'
import { activeChainStore } from './active-chain-store'
import { addressStore } from './address-store-instance'
import { chainInfoStore } from './chain-infos-store'
import {
  autoFetchedCW20DenomsStore,
  betaCW20DenomsStore,
  betaERC20DenomsStore,
  cw20DenomsStore,
  denomsStore,
  disabledCW20DenomsStore,
  enabledCW20DenomsStore,
  erc20DenomsStore,
  rootDenomsStore,
} from './denoms-store-instance'
import { selectedNetworkStore } from './selected-network-store'

const storageAdapter = getStorageAdapter()

export const currencyStore = new CurrencyStore(storageAdapter)
export const priceStore = new PriceStore(currencyStore)
export const nmsStore = new NmsStore()

export const ibcTraceFetcher = new IbcTraceFetcher(rootDenomsStore)
export const aggregatedChainsStore = new AggregatedChainsStore()

export const balanceStore = new BalanceStore(
  addressStore,
  priceStore,
  nmsStore,
  rootDenomsStore,
  chainInfoStore,
  aggregatedChainsStore,
  activeChainStore,
  selectedNetworkStore,
)

export const cw20TokenBalanceStore = new CW20DenomBalanceStore(
  chainInfoStore,
  nmsStore,
  activeChainStore,
  addressStore,
  selectedNetworkStore,
  denomsStore,
  cw20DenomsStore,
  autoFetchedCW20DenomsStore,
  betaCW20DenomsStore,
  enabledCW20DenomsStore,
  disabledCW20DenomsStore,
  priceStore,
  aggregatedChainsStore,
)

export const compassSeiEvmConfigStore = new CompassSeiEvmConfigStore()

export const erc20TokenBalanceStore = new ERC20DenomBalanceStore(
  chainInfoStore,
  nmsStore,
  activeChainStore,
  addressStore,
  selectedNetworkStore,
  denomsStore,
  erc20DenomsStore,
  priceStore,
  betaERC20DenomsStore,
  disabledCW20DenomsStore,
  enabledCW20DenomsStore,
  compassSeiEvmConfigStore,
)

export const evmBalanceStore = new EvmBalanceStore(
  activeChainStore,
  selectedNetworkStore,
  addressStore,
  chainInfoStore,
  compassSeiEvmConfigStore,
  rootDenomsStore,
  storageAdapter,
  priceStore,
)
