import {
  ChainCosmosSdkStore,
  ChainInfosConfigStore,
  GovStore,
  SpamProposalsStore,
} from '@leapwallet/cosmos-wallet-store'

import { activeChainStore } from './active-chain-store'
import { addressStore } from './address-store-instance'
import { aggregatedChainsStore, nmsStore } from './balance-store'
import { chainInfoStore } from './chain-infos-store'
import { selectedNetworkStore } from './selected-network-store'

const spamProposalsStore = new SpamProposalsStore()
export const chainCosmosSdkStore = new ChainCosmosSdkStore()
export const chainInfosConfigStore = new ChainInfosConfigStore()

export const governanceStore = new GovStore(
  chainInfoStore,
  activeChainStore,
  selectedNetworkStore,
  spamProposalsStore,
  nmsStore,
  aggregatedChainsStore,
  chainCosmosSdkStore,
  chainInfosConfigStore,
  addressStore,
)
