import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import {
  ChainCosmosSdkStore,
  ChainInfosConfigStore,
  ChainInfosStore,
  CompassSeiTokensAssociationStore,
} from '@leapwallet/cosmos-wallet-store'
import { getStorageAdapter } from 'utils/storageAdapter'

const storageAdapter = getStorageAdapter()

export const chainInfoStore = new ChainInfosStore(ChainInfos)
export const compassTokensAssociationsStore = new CompassSeiTokensAssociationStore(storageAdapter)
export const chainInfosConfigStore = new ChainInfosConfigStore()
export const chainCosmosSdkStore = new ChainCosmosSdkStore()
