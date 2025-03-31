import { useSecretTokenStore } from '@leapwallet/cosmos-wallet-hooks'
import { SnipDenoms } from '@leapwallet/cosmos-wallet-sdk'
import { useEffect } from 'react'

export function useInitSecretTokens() {
  const { setSecretTokens } = useSecretTokenStore()
  useEffect(() => {
    setSecretTokens(SnipDenoms)
  }, [setSecretTokens])
}
