import { FeatureFlagStore } from '@leapwallet/cosmos-wallet-store'

import { getStorageAdapter } from '../utils/storageAdapter'

const storageAdapter = getStorageAdapter()

export const featureFlagStore = new FeatureFlagStore(storageAdapter)
