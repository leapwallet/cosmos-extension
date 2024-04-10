import { Leap } from '@leapwallet/cosmos-wallet-provider'
import { Ethereum } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'

import { isCompassWallet } from '../utils/isCompassWallet'

export interface CustomWindow extends Window {
  getEnigmaUtils: unknown
  getOfflineSignerOnlyAmino: unknown
  getOfflineSigner: unknown
  getOfflineSignerAuto: unknown
  leap: Leap
  keplr: Leap
  compass: Leap
  ethereum: Ethereum
  compassEvm: Ethereum
}

declare let window: CustomWindow

export function init(leap: Leap, leapEvm?: Ethereum) {
  if (isCompassWallet()) {
    window.compass = leap

    if (leapEvm) {
      ;(function initEvm() {
        window.compassEvm = leapEvm

        if (!window.ethereum) {
          window.ethereum = leapEvm
          window.ethereum.isMetaMask = true
        }
      })()
    }
  } else {
    window.leap = leap
    if (!window.keplr) {
      window.keplr = leap
    }
  }
}
