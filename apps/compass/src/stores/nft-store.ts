import {
  BetaEvmNftTokenIdsStore,
  BetaNftChainsStore,
  BetaNftsCollectionsStore,
  NftChainsStore,
  NftStore,
} from '@leapwallet/cosmos-wallet-store'

import { getStorageAdapter } from '../utils/storageAdapter'
import { activeChainStore } from './active-chain-store'
import { addressStore } from './address-store-instance'
import { nmsStore } from './balance-store'
import { chainInfoStore } from './chain-infos-store'
import { selectedNetworkStore } from './selected-network-store'
const storageAdapter = getStorageAdapter()

export const nftChainsStore = new NftChainsStore()
export const betaNftChainsStore = new BetaNftChainsStore(storageAdapter)
export const betaNftsCollectionsStore = new BetaNftsCollectionsStore(storageAdapter)
export const betaEvmNftTokenIdsStore = new BetaEvmNftTokenIdsStore(storageAdapter)

export const nftStore = new NftStore(
  chainInfoStore,
  nmsStore,
  addressStore,
  nftChainsStore,
  betaNftChainsStore,
  selectedNetworkStore,
  betaNftsCollectionsStore,
  activeChainStore,
  betaEvmNftTokenIdsStore,
)
