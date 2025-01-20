import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import {
  ChainInfosStore,
  ChainTagsStore,
  CompassSeiTokensAssociationStore,
} from '@leapwallet/cosmos-wallet-store'
import { getStorageAdapter } from 'utils/storageAdapter'

const storageAdapter = getStorageAdapter()

export const chainInfoStore = new ChainInfosStore(ChainInfos)
export const chainTagsStore = new ChainTagsStore(storageAdapter)
export const compassTokensAssociationsStore = new CompassSeiTokensAssociationStore()
