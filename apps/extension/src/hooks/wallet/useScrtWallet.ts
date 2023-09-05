import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { decrypt } from '@leapwallet/leap-keychain'
import { usePassword } from 'hooks/settings/usePassword'
import { useCallback } from 'react'
import { Wallet } from 'secretjs'

export function useSecretWallet() {
  const activeWallet = useActiveWallet()
  const password = usePassword()

  return useCallback(async () => {
    const mnemonic = decrypt(activeWallet?.cipher as string, password as string)

    const wallet = await new Wallet(mnemonic, {
      hdAccountIndex: activeWallet?.addressIndex,
    })
    return wallet
  }, [password, activeWallet])
}
