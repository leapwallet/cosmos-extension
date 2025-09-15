import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import {
  ChainCosmosSdkStore,
  ChainInfosConfigStore,
  ChainInfosStore,
  ChainTagsStore,
  CompassSeiTokensAssociationStore,
  MiscellaneousDataStore,
  PopularTokensStore,
} from '@leapwallet/cosmos-wallet-store'
import { getStorageAdapter } from 'utils/storageAdapter'

const storageAdapter = getStorageAdapter()

export const chainInfoStore = new ChainInfosStore(ChainInfos)
export const chainTagsStore = new ChainTagsStore(storageAdapter)
export const popularTokensStore = new PopularTokensStore(storageAdapter)
export const compassTokensAssociationsStore = new CompassSeiTokensAssociationStore(storageAdapter)
export const miscellaneousDataStore = new MiscellaneousDataStore()
export const chainInfosConfigStore = new ChainInfosConfigStore()
export const chainCosmosSdkStore = new ChainCosmosSdkStore()
