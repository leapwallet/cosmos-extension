import {
  Key,
  useActiveWallet,
  useInitAirdropsEligibilityData,
} from '@leapwallet/cosmos-wallet-hooks'
import { KeyChain } from '@leapwallet/leap-keychain'

export const useAirdropsData = () => {
  const activeWallet = useActiveWallet()
  const { fetchAirdropsEligibilityData } = useInitAirdropsEligibilityData()

  const fetchAirdropsData = async () => {
    const allWallets = await KeyChain.getAllWallets()
    const addresses = Object.values(
      Object.values(allWallets).filter((wallet: Key) => wallet.id === activeWallet?.id)?.[0]
        ?.addresses,
    )
    const uniqueAddresses = [...new Set(addresses)]
    fetchAirdropsEligibilityData(uniqueAddresses)
  }

  return fetchAirdropsData
}
