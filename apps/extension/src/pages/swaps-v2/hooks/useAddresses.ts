import { useActiveWallet, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { useEffect, useState } from 'react'

export function useAddresses(chainIds: string[] | undefined = []) {
  const activeWallet = useActiveWallet()
  const chains = useGetChains()
  const [userAddresses, setUserAddresses] = useState<string[] | null>(null)
  const [userAddressesError, setUserAddressesError] = useState('')

  useEffect(() => {
    if (activeWallet && chainIds.length > 0) {
      const _userAddresses: string[] = []

      for (const chainId of chainIds) {
        const chain = Object.values(chains).find((chain) => chain.chainId === chainId)

        if (!chain) {
          setUserAddressesError(`Failed to get address for chain ${chainId}`)
          return
        }

        _userAddresses.push(activeWallet.addresses[chain.key])
      }

      setUserAddresses(_userAddresses)
    }
  }, [activeWallet, chainIds, chains])

  return { userAddresses, userAddressesError }
}
