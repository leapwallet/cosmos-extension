import { ActivityStore } from '@leapwallet/cosmos-wallet-store'

import { activeChainStore } from './active-chain-store'
import { addressStore } from './address-store-instance'
import { ankrChainMapStore, ibcTraceFetcher } from './balance-store'
import { chainInfoStore } from './chain-infos-store'
import { chainApisStore } from './chains-api-store'
import { selectedNetworkStore } from './selected-network-store'

export const activityStore = new ActivityStore(
  chainInfoStore,
  addressStore,
  selectedNetworkStore,
  activeChainStore,
  ankrChainMapStore,
  ibcTraceFetcher,
  chainApisStore,
)
