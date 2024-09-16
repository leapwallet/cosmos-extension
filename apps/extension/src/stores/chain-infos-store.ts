import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { ChainInfosStore, ChainTagsStore } from '@leapwallet/cosmos-wallet-store'
import { getStorageAdapter } from 'utils/storageAdapter'

const storageAdapter = getStorageAdapter()

export const chainInfoStore = new ChainInfosStore(ChainInfos)
export const chainTagsStore = new ChainTagsStore(storageAdapter)
