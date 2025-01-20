import { useQuery } from '@tanstack/react-query'
import { CHECKED_NOBLE_AIRDROP_PUBKEYS } from 'config/storage-keys'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useEffect, useState } from 'react'
import Browser, { Storage } from 'webextension-polyfill'

export function useAirdropEligibility() {
  const { activeWallet } = useActiveWallet()
  const noblePubKeys = activeWallet?.pubKeys?.noble
  const [isEligible, setIsEligible] = useState(true)

  useEffect(() => {
    const nobleAirdropPubKeysListener = (changes: Record<string, Storage.StorageChange>) => {
      if (changes[CHECKED_NOBLE_AIRDROP_PUBKEYS]) {
        const { newValue } = changes[CHECKED_NOBLE_AIRDROP_PUBKEYS]
        if (newValue.includes(noblePubKeys)) {
          setIsEligible(false)
        }
      }
    }

    Browser.storage.onChanged.addListener(nobleAirdropPubKeysListener)

    return () => Browser.storage.onChanged.removeListener(nobleAirdropPubKeysListener)
  }, [noblePubKeys])

  const { status: eligibilityStatus } = useQuery(['airdropEligibility', noblePubKeys], async () => {
    const response = await fetch('https://assets.leapwallet.io/cosmos/noble/airdrop-wallets.json')
    const nobleAirdropWallets: { pub_key: { key: string } }[] = await response.json()

    const _isEligible = nobleAirdropWallets.some((wallet) => wallet.pub_key.key === noblePubKeys)
    setIsEligible(_isEligible)
  })

  return { isEligible, eligibilityStatus }
}
