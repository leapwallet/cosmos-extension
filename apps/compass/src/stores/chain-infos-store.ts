import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import {
  ChainCosmosSdkStore,
  ChainInfosConfigStore,
  ChainInfosStore,
  CompassSeiTokensAssociationStore,
} from '@leapwallet/cosmos-wallet-store'

export const chainInfoStore = new ChainInfosStore(ChainInfos)
export const compassTokensAssociationsStore = new CompassSeiTokensAssociationStore()
export const chainInfosConfigStore = new ChainInfosConfigStore()
export const chainCosmosSdkStore = new ChainCosmosSdkStore()
