import { useScrtKeysStore } from '@leapwallet/cosmos-wallet-hooks'
import { decrypt } from '@leapwallet/cosmos-wallet-sdk'
import { useEffect } from 'react'
import browser from 'webextension-polyfill'

import { QUERY_PERMIT, VIEWING_KEYS } from '../../config/storage-keys'
import { usePassword } from '../settings/usePassword'

export function useInitSecretViewingKeys() {
  const { setViewingKeys, setQueryPermits } = useScrtKeysStore()
  const password = usePassword()

  useEffect(() => {
    async function init() {
      const storage = await browser.storage.local.get([VIEWING_KEYS, QUERY_PERMIT])
      const keys = storage[VIEWING_KEYS] ?? {}
      const permits = storage[QUERY_PERMIT] ?? {}

      for (const address of Object.keys(keys)) {
        for (const contract of Object.keys(keys[address])) {
          keys[address][contract] = decrypt(keys[address][contract], password as string)
        }
      }
      setViewingKeys(keys)
      for (const address of Object.keys(permits)) {
        const permit = permits[address]
        permits[address] = JSON.parse(decrypt(permit, password as string) ?? '{}')
      }

      setQueryPermits(permits)
    }
    if (password) {
      init()
    }
  }, [password])
}
