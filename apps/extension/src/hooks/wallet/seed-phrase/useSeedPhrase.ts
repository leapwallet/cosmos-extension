/* eslint-disable @typescript-eslint/no-namespace */

import { createMnemonic } from '@leapwallet/cosmos-wallet-sdk'
import { ENCRYPTED_ACTIVE_WALLET } from '@leapwallet/leap-keychain'
import { decrypt } from '@leapwallet/leap-keychain'
import * as bip39 from 'bip39'
import { useCallback, useEffect, useRef, useState } from 'react'
import browser from 'webextension-polyfill'

import { ACTIVE_WALLET } from '../../../config/storage-keys'
import useActiveWallet from '../../settings/useActiveWallet'

export namespace SeedPhrase {
  // store {seed: string, lastIndex: number}
  const KEY = 'active-wallet'
  // store encrypted mnemonic string
  const MNEMONIC_KEY = 'stored-encrypted-mnemonic'
  // encoding used from buffer to string and vice versa;
  const ENCODING = 'hex'

  export function validateSeedPhrase(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic)
  }

  export function useTestPassword(): (password: string, message?: string) => void {
    const secret = useRef()

    useEffect(() => {
      browser.storage.local.get([ENCRYPTED_ACTIVE_WALLET, ACTIVE_WALLET]).then((data) => {
        const encryptedActiveWallet = data[ENCRYPTED_ACTIVE_WALLET]
        if (encryptedActiveWallet) {
          secret.current = encryptedActiveWallet
        } else {
          secret.current = data[ACTIVE_WALLET]?.cipher
        }
      })
    }, [])

    const testPassword = useCallback(
      (password: string, encryptedMessage?: string) => {
        try {
          const decrypted = decrypt(encryptedMessage ?? secret.current ?? '', password)
          if (decrypted === '') {
            throw new Error('Wrong Password')
          }
        } catch (e) {
          throw new Error('Wrong Password')
        }
      },
      [secret],
    )
    return testPassword
  }

  export function CreateNewMnemonic() {
    const mnemonic = createMnemonic(12)
    return mnemonic
  }

  export function useMnemonic(password: string): string {
    const [mnemonic, setMnemonic] = useState('')
    const { activeWallet } = useActiveWallet()

    useEffect(() => {
      password &&
        browser.storage.local
          .get([MNEMONIC_KEY])
          .then(() => {
            const _mnemonic = decrypt(activeWallet?.cipher as string, password)
            return _mnemonic
          })
          .then((mnemonic) => {
            setMnemonic(mnemonic)
          })
    }, [password])

    return mnemonic
  }
}
