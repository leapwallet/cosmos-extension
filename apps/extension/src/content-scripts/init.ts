import { Leap } from '@leapwallet/cosmos-wallet-provider'

export interface CustomWindow extends Window {
  getEnigmaUtils: unknown
  getOfflineSignerOnlyAmino: unknown
  getOfflineSigner: unknown
  getOfflineSignerAuto: unknown
  leap: Leap
  keplr: Leap
  compass: Leap
}

declare let window: CustomWindow

export function init(leap: Leap) {
  if (process.env.APP === 'compass') {
    window.compass = leap
  } else {
    window.leap = leap
    if (!window.keplr) {
      window.keplr = leap
    }
  }
}
