import { ActiveChainStore } from '@leapwallet/cosmos-wallet-store'
import { isCompassWallet } from 'utils/isCompassWallet'

import { getStorageAdapter } from '../utils/storageAdapter'
const storageAdapter = getStorageAdapter()
const isCompass = isCompassWallet()
export const activeChainStore = new ActiveChainStore(storageAdapter, isCompass)
