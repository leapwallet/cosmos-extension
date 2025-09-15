import { ApiAvailabilityStore, ChainApisStore, IbcDataStore } from '@leapwallet/cosmos-wallet-store'
import { getStorageAdapter } from 'utils/storageAdapter'

import { chainInfoStore } from './chain-infos-store'

export const apiAvailabilityStore = new ApiAvailabilityStore()
export const chainApisStore = new ChainApisStore(chainInfoStore, apiAvailabilityStore)
export const ibcDataStore = new IbcDataStore(chainInfoStore, getStorageAdapter())
