import { useScrtKeysStore } from '@leapwallet/cosmos-wallet-hooks'
import { PasswordStore } from '@leapwallet/cosmos-wallet-store'
import { decrypt } from '@leapwallet/leap-keychain'
import { useEffect } from 'react'
import browser from 'webextension-polyfill'

import { QUERY_PERMIT, VIEWING_KEYS } from '../../config/storage-keys'

export function useInitSecretViewingKeys(passwordStore: PasswordStore) {
  const { setViewingKeys, setQueryPermits } = useScrtKeysStore()

  useEffect(() => {
    async function init() {
      if (!passwordStore.password) return
      const storage = await browser.storage.local.get([VIEWING_KEYS, QUERY_PERMIT])
      const keys = storage[VIEWING_KEYS] ?? {}
      const permits = storage[QUERY_PERMIT] ?? {}

      for (const address of Object.keys(keys)) {
        for (const contract of Object.keys(keys[address])) {
          let viewingKey = decrypt(keys[address][contract], passwordStore.password)
          if (viewingKey === '') {
            viewingKey = decrypt(keys[address][contract], passwordStore.password, 100)
          }
          keys[address][contract] = decrypt(keys[address][contract], passwordStore.password)
        }
      }
      setViewingKeys(keys)
      for (const address of Object.keys(permits)) {
        const permit = permits[address]
        permits[address] = JSON.parse(decrypt(permit, passwordStore.password) ?? '{}')
      }

      setQueryPermits(permits)
    }

    if (passwordStore.password) {
      init()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passwordStore.password])
}
