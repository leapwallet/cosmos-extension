import {
  AutoFetchedCW20DenomsStore,
  BetaCW20DenomsStore,
  BetaERC20DenomsStore,
  BetaNativeDenomsStore,
  CompassTokenTagsStore,
  CW20DenomChainsStore,
  CW20DenomsStore,
  DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
  ERC20DenomsChainsStore,
  ERC20DenomsStore,
  Erc404DenomsStore,
  InteractedDenomsStore,
  RootCW20DenomsStore,
  RootDenomsStore,
  RootERC20DenomsStore,
  WhitelistedFactoryTokensStore,
} from '@leapwallet/cosmos-wallet-store'
import browser from 'webextension-polyfill'

import { getStorageAdapter } from '../utils/storageAdapter'
import { activeChainStore } from './active-chain-store'
import { addressStore } from './address-store-instance'
import { chainInfoStore } from './chain-infos-store'

const app = 'extension'
const version = browser.runtime.getManifest().version
const storageAdapter = getStorageAdapter()
const cw20DenomChainsStore = new CW20DenomChainsStore(false, storageAdapter)
const erc20DenomChainStore = new ERC20DenomsChainsStore(false, storageAdapter)

export const erc404DenomsStore = new Erc404DenomsStore(activeChainStore)
export const erc20DenomsStore = new ERC20DenomsStore(activeChainStore, erc20DenomChainStore)
export const denomsStore = new DenomsStore()
export const cw20DenomsStore = new CW20DenomsStore(activeChainStore, cw20DenomChainsStore)

export const autoFetchedCW20DenomsStore = new AutoFetchedCW20DenomsStore(
  activeChainStore,
  cw20DenomChainsStore,
  storageAdapter,
)

export const betaCW20DenomsStore = new BetaCW20DenomsStore(activeChainStore, storageAdapter)
export const betaNativeDenomsStore = new BetaNativeDenomsStore(activeChainStore, storageAdapter)
export const betaERC20DenomsStore = new BetaERC20DenomsStore(activeChainStore, storageAdapter)
export const compassTokenTagsStore = new CompassTokenTagsStore(app, version, false, denomsStore)

export const enabledCW20DenomsStore = new EnabledCW20DenomsStore(
  activeChainStore,
  addressStore,
  storageAdapter,
)

export const disabledCW20DenomsStore = new DisabledCW20DenomsStore(
  activeChainStore,
  addressStore,
  storageAdapter,
)

export const rootCW20DenomsStore = new RootCW20DenomsStore(
  cw20DenomsStore,
  betaCW20DenomsStore,
  autoFetchedCW20DenomsStore,
)

export const rootERC20DenomsStore = new RootERC20DenomsStore(erc20DenomsStore, betaERC20DenomsStore)
export const rootDenomsStore = new RootDenomsStore(
  denomsStore,
  rootCW20DenomsStore,
  rootERC20DenomsStore,
  betaNativeDenomsStore,
  chainInfoStore,
)

export const whitelistedFactoryTokensStore = new WhitelistedFactoryTokensStore(storageAdapter)
export const interactedDenomsStore = new InteractedDenomsStore(
  activeChainStore,
  addressStore,
  storageAdapter,
)
