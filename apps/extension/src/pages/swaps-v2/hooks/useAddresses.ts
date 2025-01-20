import { useActiveWallet, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { useUpdateKeyStore } from 'hooks/settings/useActiveWallet'
import { useEffect, useState } from 'react'

export function useAddresses(chainIds: string[] | undefined = []) {
  const activeWallet = useActiveWallet()
  const chains = useGetChains()
  const [userAddresses, setUserAddresses] = useState<string[] | null>(null)
  const [userAddressesError, setUserAddressesError] = useState('')
  const updateKeyStore = useUpdateKeyStore()

  useEffect(() => {
    const getAddresses = async () => {
      if (activeWallet && chainIds.length > 0) {
        const _userAddresses: string[] = []

        for await (const chainId of chainIds) {
          const chain = Object.values(chains).find((chain) => chain.chainId === chainId)

          if (!chain) {
            setUserAddressesError(`Failed to get address for chain ${chainId}`)
            return
          }
          let address = activeWallet?.addresses?.[chain.key]
          if (!address) {
            try {
              const keyStore = await updateKeyStore(activeWallet, chain.key)
              const _address = keyStore[activeWallet.id]?.addresses[chain.key]
              if (!_address) {
                throw new Error('Failed to get address for chain ' + chainId)
              }
              address = _address
            } catch (e) {
              setUserAddressesError(`Failed to get address for chain ${chainId}`)
              return
            }
          }
          _userAddresses.push(address)
        }

        setUserAddresses(_userAddresses)
      }
    }

    getAddresses()
  }, [activeWallet, chainIds, chains, updateKeyStore])

  return { userAddresses, userAddressesError, setUserAddressesError }
}
