import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { decrypt } from '@leapwallet/leap-keychain'
import { useCallback } from 'react'
import { Wallet } from 'secretjs'
import { passwordStore } from 'stores/password-store'

export function useSecretWallet() {
  const activeWallet = useActiveWallet()

  return useCallback(async () => {
    if (!passwordStore.password) throw new Error('Password not set')
    const mnemonic = decrypt(activeWallet?.cipher as string, passwordStore.password)

    const wallet = new Wallet(mnemonic, {
      hdAccountIndex: activeWallet?.addressIndex,
    })
    return wallet
  }, [activeWallet])
}
