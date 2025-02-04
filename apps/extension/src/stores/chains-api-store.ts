import { ApiAvailabilityStore, ChainApisStore } from '@leapwallet/cosmos-wallet-store'

import { chainInfoStore } from './chain-infos-store'

export const apiAvailabilityStore = new ApiAvailabilityStore()
export const chainApisStore = new ChainApisStore(chainInfoStore, apiAvailabilityStore)
