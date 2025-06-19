import { ActiveChainStore } from '@leapwallet/cosmos-wallet-store'

import { getStorageAdapter } from '../utils/storageAdapter'
const storageAdapter = getStorageAdapter()
export const activeChainStore = new ActiveChainStore(storageAdapter, false)
