import { ZeroStateBannerStore } from '@leapwallet/cosmos-wallet-store'
import browser from 'webextension-polyfill'

import { getStorageAdapter } from '../utils/storageAdapter'

const app = 'extension'
const version = browser.runtime.getManifest().version
const storageAdapter = getStorageAdapter()

export const zeroStateBannerStore = new ZeroStateBannerStore(app, version, storageAdapter)
