import {
  AutoFetchedCW20DenomsStore,
  BetaCW20DenomsStore,
  BetaERC20DenomsStore,
  BetaNativeDenomsStore,
  CW20DenomChainsStore,
  CW20DenomsStore,
  DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
  ERC20DenomsChainsStore,
  ERC20DenomsStore,
  InteractedDenomsStore,
  RootCW20DenomsStore,
  RootDenomsStore,
  RootERC20DenomsStore,
  WhitelistedFactoryTokensStore,
} from '@leapwallet/cosmos-wallet-store'

import { getStorageAdapter } from '../utils/storageAdapter'
import { activeChainStore } from './active-chain-store'
import { addressStore } from './address-store-instance'

const storageAdapter = getStorageAdapter()
const cw20DenomChainsStore = new CW20DenomChainsStore()
const erc20DenomChainStore = new ERC20DenomsChainsStore()
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
)

export const interactedDenomsStore = new InteractedDenomsStore(
  activeChainStore,
  addressStore,
  storageAdapter,
)
export const whitelistedFactoryTokensStore = new WhitelistedFactoryTokensStore(storageAdapter)
