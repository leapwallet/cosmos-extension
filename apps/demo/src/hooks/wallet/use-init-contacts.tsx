import { useEffect } from 'react'

import { AppConfig } from '~/config'
import { AddressBook } from '~/util/addressbook'

const dummyContacts = {
  cosmos12k0k3q3x7gljv2d0jxrulwx0jmdtpswtlakhn4: {
    address: 'cosmos12k0k3q3x7gljv2d0jxrulwx0jmdtpswtlakhn4',
    blockchain: 'cosmos',
    emoji: 1,
    name: 'Ross',
    memo: '',
  },
  cosmos1u8tmwkrcf8wadc6knyx95ml96gy86vqhvxtswx: {
    address: 'cosmos1u8tmwkrcf8wadc6knyx95ml96gy86vqhvxtswx',
    blockchain: 'cosmos',
    emoji: 2,
    name: 'Monica',
    memo: '',
  },
  osmo1c6m4w2wlsk00tz027sdzpmzxcmw4nquvhck95j: {
    address: 'osmo1c6m4w2wlsk00tz027sdzpmzxcmw4nquvhck95j',
    blockchain: 'osmosis',
    emoji: 3,
    name: 'Joey',
    memo: '',
  },
  cosmos1mq5p37rgdx3534f5fny2zpnmy4j4amnx340c5l: {
    address: 'cosmos1mq5p37rgdx3534f5fny2zpnmy4j4amnx340c5l',
    blockchain: 'cosmos',
    emoji: 4,
    name: 'Rachael',
    memo: '',
  },
  juno1fnuewtrvlqlgulejfp7kpxp0f0wkjmjmsg8n7z: {
    address: 'juno1fnuewtrvlqlgulejfp7kpxp0f0wkjmjmsg8n7z',
    blockchain: 'juno',
    emoji: 5,
    name: 'Phoebe',
    memo: '',
  },
  juno1ep03pv7rak7gxjn3h3njdy8udjdfxa64mr6cms: {
    address: 'juno1ep03pv7rak7gxjn3h3njdy8udjdfxa64mr6cms',
    blockchain: 'juno',
    emoji: 6,
    name: 'Mike',
    memo: '',
  },
}

const useInitContacts = () => {
  useEffect(() => {
    const book = {
      ...(AddressBook.getAllEntries() ?? {}),
      ...dummyContacts,
    }
    localStorage.setItem(AppConfig.STORAGE_KEYS.ADDRESS_BOOK, JSON.stringify(book))
  }, [])
}

export default useInitContacts
