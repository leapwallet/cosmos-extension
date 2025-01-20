import { EpochIntervalStore } from '@leapwallet/cosmos-wallet-store'

import { chainInfoStore } from './chain-infos-store'
import { rootStakeStore } from './root-store'
import { selectedNetworkStore } from './selected-network-store'

export const epochIntervalStore = new EpochIntervalStore(
  rootStakeStore,
  chainInfoStore,
  selectedNetworkStore,
)
