import { useActiveChain, useAddress, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { getEthereumAddress } from '@leapwallet/cosmos-wallet-sdk'
import { SHOW_ETH_ADDRESS_CHAINS } from 'config/constants'
import { useMemo } from 'react'

import useActiveWallet from './settings/useActiveWallet'

export function useGetWalletAddresses() {
  const { activeWallet } = useActiveWallet()
  const activeChain = useActiveChain()
  const address = useAddress()

  return useMemo(() => {
    if (
      activeWallet?.walletType !== WALLETTYPE.LEDGER &&
      SHOW_ETH_ADDRESS_CHAINS.includes(activeChain)
    ) {
      return [getEthereumAddress(address), address]
    }

    return [address]
  }, [activeChain, address, activeWallet])
}
