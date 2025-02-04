import { TransactionConfigsStore } from '@leapwallet/cosmos-wallet-store'

import { getStorageAdapter } from '../utils/storageAdapter'

const storageAdapter = getStorageAdapter()

export const transactionConfigsStore = new TransactionConfigsStore(storageAdapter)
