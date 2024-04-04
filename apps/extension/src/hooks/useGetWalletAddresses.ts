import { useActiveChain, useAddress, useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { getEthereumAddress } from '@leapwallet/cosmos-wallet-sdk'
import { SHOW_ETH_ADDRESS_CHAINS } from 'config/constants'
import { useMemo } from 'react'
import { isLedgerEnabled } from 'utils/isLedgerEnabled'

export function useGetWalletAddresses() {
  const activeChain = useActiveChain()
  const address = useAddress()
  const { chains } = useChainsStore()

  return useMemo(() => {
    if (
      address &&
      isLedgerEnabled(activeChain, chains?.[activeChain]?.bip44?.coinType) &&
      SHOW_ETH_ADDRESS_CHAINS.includes(activeChain)
    ) {
      return [getEthereumAddress(address), address]
    }

    return [address]
  }, [activeChain, address, chains])
}
