import {
  AggregatedChainsStore,
  AnkrChainMapStore,
  AptosBalanceApiStore,
  BalanceAPIStore,
  BalanceStore,
  BitcoinDataStore,
  ChainFeatureFlagsStore,
  CoingeckoIdsStore,
  CompassSeiEvmConfigStore,
  CurrencyStore,
  CW20DenomBalanceStore,
  ERC20DenomBalanceStore,
  EVMBalanceAPIStore,
  EvmBalanceStore,
  IbcTraceFetcher,
  MarketDataStore,
  NmsStore,
  PriceStore,
} from '@leapwallet/cosmos-wallet-store'
import { AptosCoinDataStore } from '@leapwallet/cosmos-wallet-store/dist/bank/aptos-balance-store'
import { SolanaCoinDataStore } from '@leapwallet/cosmos-wallet-store/dist/bank/solana-balance-store'
import browser from 'webextension-polyfill'

import { getStorageAdapter } from '../utils/storageAdapter'
import { activeChainStore } from './active-chain-store'
import { addressStore } from './address-store-instance'
import { chainInfoStore } from './chain-infos-store'
import {
  autoFetchedCW20DenomsStore,
  betaCW20DenomsStore,
  betaERC20DenomsStore,
  compassTokenTagsStore,
  cw20DenomsStore,
  denomsStore,
  disabledCW20DenomsStore,
  enabledCW20DenomsStore,
  erc20DenomsStore,
  erc404DenomsStore,
  rootDenomsStore,
} from './denoms-store-instance'
import { stakeEpochStore } from './epoch-store'
import { selectedNetworkStore } from './selected-network-store'

const app = 'extension'
const version = browser.runtime.getManifest().version
const storageAdapter = getStorageAdapter()

export const chainFeatureFlagsStore = new ChainFeatureFlagsStore(app, version, storageAdapter)
export const currencyStore = new CurrencyStore(storageAdapter)
export const priceStore = new PriceStore(currencyStore)
export const marketDataStore = new MarketDataStore(currencyStore)
export const nmsStore = new NmsStore()

export const ibcTraceFetcher = new IbcTraceFetcher(rootDenomsStore)
export const aggregatedChainsStore = new AggregatedChainsStore(
  app,
  version,
  storageAdapter,
  chainFeatureFlagsStore,
)

export const coingeckoIdsStore = new CoingeckoIdsStore(storageAdapter)

export const balanceAPIStore = new BalanceAPIStore(
  chainInfoStore,
  priceStore,
  denomsStore,
  coingeckoIdsStore,
)

export const balanceStore = new BalanceStore(
  addressStore,
  priceStore,
  nmsStore,
  rootDenomsStore,
  chainInfoStore,
  aggregatedChainsStore,
  activeChainStore,
  selectedNetworkStore,
  stakeEpochStore,
  chainFeatureFlagsStore,
  balanceAPIStore,
  currencyStore,
  coingeckoIdsStore,
  storageAdapter,
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
  compassTokenTagsStore,
  currencyStore,
  coingeckoIdsStore,
)

export const compassSeiEvmConfigStore = new CompassSeiEvmConfigStore()
export const ankrChainMapStore = new AnkrChainMapStore()

export const evmBalanceApiStore = new EVMBalanceAPIStore(
  chainInfoStore,
  priceStore,
  denomsStore,
  betaERC20DenomsStore,
  coingeckoIdsStore,
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
  aggregatedChainsStore,
  nmsStore,
  evmBalanceApiStore,
  currencyStore,
  coingeckoIdsStore,
)

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
  aggregatedChainsStore,
  erc404DenomsStore,
  ankrChainMapStore,
  evmBalanceStore,
  currencyStore,
  compassTokenTagsStore,
  evmBalanceApiStore,
  coingeckoIdsStore,
)

export const aptosBalanceApiStore = new AptosBalanceApiStore(
  chainInfoStore,
  priceStore,
  denomsStore,
  coingeckoIdsStore,
)

export const aptosCoinDataStore = new AptosCoinDataStore(
  activeChainStore,
  selectedNetworkStore,
  addressStore,
  priceStore,
  denomsStore,
  chainInfoStore,
  aptosBalanceApiStore,
  currencyStore,
  coingeckoIdsStore,
)

export const bitcoinBalanceStore = new BitcoinDataStore(
  activeChainStore,
  selectedNetworkStore,
  addressStore,
  priceStore,
  denomsStore,
  chainInfoStore,
  aggregatedChainsStore,
  currencyStore,
)

export const solanaCoinDataStore = new SolanaCoinDataStore(
  activeChainStore,
  selectedNetworkStore,
  addressStore,
  priceStore,
  rootDenomsStore,
  chainInfoStore,
  currencyStore,
  coingeckoIdsStore,
)
