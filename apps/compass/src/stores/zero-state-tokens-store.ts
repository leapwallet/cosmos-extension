import { ZeroStateTokensStore } from '@leapwallet/cosmos-wallet-store'
import browser from 'webextension-polyfill'

import { activeChainStore } from './active-chain-store'
import { chainFeatureFlagsStore, percentageChangeDataStore, priceStore } from './balance-store'
import { chainInfoStore } from './chain-infos-store'
import { denomsStore } from './denoms-store-instance'

const app = 'extension'
const version = browser.runtime.getManifest().version
export const zeroStateTokensStore = new ZeroStateTokensStore(
  app,
  version,
  chainFeatureFlagsStore,
  chainInfoStore,
  denomsStore,
  priceStore,
  percentageChangeDataStore,
  activeChainStore,
)
