import { AddressStore } from '@leapwallet/cosmos-wallet-store'

import { getStorageAdapter } from '../utils/storageAdapter'
const storageAdapter = getStorageAdapter()

export const addressStore = new AddressStore(storageAdapter)
