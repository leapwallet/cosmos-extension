import {
  Key,
  useActiveWallet,
  useInitAirdropsEligibilityData,
} from '@leapwallet/cosmos-wallet-hooks'
import { pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { KeyChain } from '@leapwallet/leap-keychain'
import { useCallback, useMemo } from 'react'

import { useChainInfos } from './useChainInfos'

export const useAirdropsData = () => {
  const activeWallet = useActiveWallet()
  const { fetchAirdropsEligibilityData } = useInitAirdropsEligibilityData()
  const chains = useChainInfos()
  const evmChainKeys = useMemo(
    () => Object.keys(chains).filter((key) => chains[key as SupportedChain].evmOnlyChain),
    [chains],
  )

  const fetchAirdropsData = useCallback(async () => {
    const allWallets = await KeyChain.getAllWallets()
    const selectedWallet = Object.values(allWallets ?? {}).filter(
      (wallet: Key) => wallet.id === activeWallet?.id,
    )?.[0]
    const addresses = Object.values(selectedWallet?.addresses ?? {})
    if (selectedWallet?.pubKeys) {
      const pubKeys = selectedWallet.pubKeys
      evmChainKeys.forEach((evmChainKey) => {
        if (pubKeys[evmChainKey]) {
          addresses.push(pubKeyToEvmAddressToShow(pubKeys[evmChainKey]))
        }
      })
    }
    const uniqueAddresses = [...new Set(addresses)]
    fetchAirdropsEligibilityData(uniqueAddresses)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet?.id, fetchAirdropsEligibilityData])

  return fetchAirdropsData
}
