import { Leap } from '@leapwallet/cosmos-wallet-provider/dist/provider/core'
import { LeapAptos } from '@leapwallet/cosmos-wallet-provider/dist/provider/core-aptos'
import { LeapBitcoin } from '@leapwallet/cosmos-wallet-provider/dist/provider/core-bitcoin'
import { Ethereum } from '@leapwallet/cosmos-wallet-provider/dist/provider/types'
import { registerWallet } from '@wallet-standard/core'
import { v4 as uuidv4 } from 'uuid'

import { isCompassWallet } from '../utils/isCompassWallet'
import { LeapFaviconDataURI } from './leap-favicon-data-uri'

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

function setUnwritableProperty<T, U>(object: T, property: string, value: U) {
  const descriptor = Object.getOwnPropertyDescriptor(object, property)
  if (descriptor && !descriptor.configurable) {
    /*eslint-disable no-console*/
    console.warn(`Cannot redefine non-configurable property '${property}'.`)
    return false
  }
  Object.defineProperty(object, property, {
    value: value,
    writable: false,
  })
  return true
}

export function init(
  leap: Leap,
  leapEvm?: Ethereum,
  leapAptos?: LeapAptos,
  leapBitcoin?: LeapBitcoin,
) {
  if (leapEvm) {
    // eslint-disable-next-line no-use-before-define
    initEvm(leapEvm, isCompassWallet())
  }

  if (isCompassWallet()) {
    setUnwritableProperty<Window, Leap>(window, 'compass', leap)
  } else {
    setUnwritableProperty<Window, Leap>(window, 'leap', leap)
    if (!window.keplr) {
      window.keplr = window.leap
    }

    if (leapAptos) {
      // eslint-disable-next-line no-use-before-define
      initAptos(leapAptos)
    }

    if (leapBitcoin) {
      setUnwritableProperty<Window, LeapBitcoin>(window, 'leapBitcoin', leapBitcoin)
    }
  }
}

function initEvm(leapEvm: Ethereum, isCompass: boolean) {
  const uuid = uuidv4()
  let info = {
    uuid,
    name: 'Leap Wallet',
    icon: LeapFaviconDataURI,
    rdns: 'io.leapwallet.LeapWallet',
  }

  if (isCompass) {
    window.compassEvm = leapEvm
    info = {
      uuid,
      name: 'Compass Wallet',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAFeUlEQVR4Ab1WfUxVZRj/vedcP5aYpjO/Qs1WLfuQa1PcBLIPS82WYlrplKg/TCWXaxZaTbcimFs1PlJsI0AjMQSlgeh0pqElWANyq7ZqI5li/ePlcl0JnPP2PM977vVeRNI/7Nl9ec95z3ue3/v7PR8HBbLhk2ZPcmyn2LJUgtYYDjFFP4t+tsxQNjTf02zZA0B/YPkGwqU1vleWj9Z43SfXivfQXt5n2779f2tnfeDgllblgTUxLgGCAGkjgWlLZgZQvA4L2rbFiRIQHx3AJ/cC6AuDDfAA6TkdmoGVHNgKkDu/7RsZX0zuE5iTxQDsnAGZoeZ9Fk8w57Bk3WK24f3KPLdon0unDe9X8jL5cLX4JBtMuxL4ciE8o2eGoTYXAq4dgeN3J4y9HeWFWfj12yoc3VuINS89x2+Rc5emHvAx3J5u2t5Dw4HrdMu6pjW+1k53gj1oxMQtYUAlzLTgMRnNYWSmlpJnh8oLMOWeyXIfN2QIZvinYOiQW3DidAtcZiKhYCHFi8y8ZJbpUNodbCHKtAmgbJADhLWkvW+sWo4J48eIjPySrYxkK5bMx7hRI4SlUcNlJjKYldPTJdeKmPKIAfRgwzkqDvkunqRctSKViaFo9z5MfWwpUha+gvb2P2Xtg42rRULtspQsoyND0bA8aRnY6bncFyAzVR5bE/w3M1bgtlvjDOCufeTbwbnzF1BVe4TiBsycdj9mJNxHihC7HgLmGHLsaEgcnS5hh74Yai+5TBa5SE6cihcXzRXGJxtbEAx1orGuFEUfvYvSPV9Rdho1Nq1Lw1iSFgzqeGBuF/nolnvXuUyj61oMXQwjRtlvZ6Bm18fGI43y6kNSn20k5U+//I5ARxCNTT/CZ2tMuftO7CzYjEVzU7hihRlL6nrgLDEDq6F3JetosGFD47AmfQml/BLExcV5sQRa29rhf3yZpC/nn22bWkx8eCoqirayGJACornt/F/I/+xLVNcdh0gggTE1HgPIWXigLA8T7hgTOcA3p5pRuLMS9Y3NCAYvefUiaWrqhhzx/qcenYX0F57FuHGjI/VcsqcGWbnFkTS0CTwGsLYsl2Lml+ttxRXIyS+hmF3yagzSF43mnsZ8Yphu45riw8zpCfhw83qMH2uAX83MxuHjDfIOd6OYGIbB2DKz8hEIdkq2SvF6ScReOMaK69AxhSr1R89Y7NM/tCD308+lTn2WxpMp002JUH26XCbRgB2dIUTLG5NInizSQVS4B5ITKQNepWvJUAcP3DuZ5FMyQqFOKRNJHmpxMa1t8KCBEZYL5iSjIxgSlkE5iGlbpg9zLbjmtD7btDMas0jODWtXYuXzC8yXiY6xdkMOxT4kz0Wp3lm6cV26jGirb2jCtpIKHDhy8koMlfkysMqZr6VRrc5DvJcw7PjsuQvI2LQV331/JvJBsOhwVwGG5WTQ5YvnxazH++dLEplmbFJ9ddpi5LyTYSQn8Iukxo7SSmwv3YtQRydcLh+tTDB6l0VfwLVf5GGiF8/svGLJ3Cum0HK03MSbDrGDQHIKShHgEDB1+XZa5msH87mz0I+xLEnPvBxJpuWp80yCeH02acZDmBQ/RhjvrjpImf0JdZ9OAZMiF9ImoeRronT/gGycOG+9l2cYU4EnJco/BwK6LNVIfpYaeU5+sbg3AwIqrLj1KG1WqYxisvRadubn3/D0nCSMHjUyksVPpCRKC2TbTglVc7g+5h0dPUd9EPqNYbQxM257ve0Pkv3BR5bieu0/JQ3biYZmlFXWXbWe+X4ebsSY4UWah1/vC8tS5yJ55jR0UHKUVdWJ3DcK+DXNs/H/WLVlOza3lQBuvgW6ne7XrUDrsVYC9VMK78fNsQD5PkZg/n9aT7X+CwJ2pse3G18qAAAAAElFTkSuQmCC',
      rdns: 'io.leapwallet.CompassWallet',
    }
  }

  function announceProvider() {
    window.dispatchEvent(
      new CustomEvent('eip6963:announceProvider', {
        detail: Object.freeze({ info, provider: leapEvm }),
      }),
    )
  }

  window.addEventListener('eip6963:requestProvider', () => {
    announceProvider()
  })

  announceProvider()
}

function initAptos(leapAptos: LeapAptos) {
  registerWallet(leapAptos)
}
