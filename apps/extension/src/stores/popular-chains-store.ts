import { PopularChainsStore } from '@leapwallet/cosmos-wallet-store'
import browser from 'webextension-polyfill'

import { chainFeatureFlagsStore } from './balance-store'

const app = 'extension'
const version = browser.runtime.getManifest().version
export const popularChainsStore = new PopularChainsStore(app, version, chainFeatureFlagsStore)
