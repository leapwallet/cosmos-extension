import { Wallet } from '@leapwallet/leap-keychain'
import { useCallback } from 'react'
import { passwordStore } from 'stores/password-store'

import { Wallet as WalletInstance } from './useWallet'

export function useSecretWallet() {
  const getWallet = WalletInstance.useGetWallet()

  return useCallback(async (): Promise<Wallet> => {
    if (!passwordStore.password) throw new Error('Password not set')
    const wallet = await getWallet()
    return wallet as unknown as Wallet
  }, [getWallet])
}
