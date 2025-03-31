import { SelectedNetworkStore } from '@leapwallet/cosmos-wallet-store'

import { getStorageAdapter } from '../utils/storageAdapter'
import { activeChainStore } from './active-chain-store'

const storageAdapter = getStorageAdapter()

export const selectedNetworkStore = new SelectedNetworkStore(activeChainStore, storageAdapter)
