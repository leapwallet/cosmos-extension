import { useActiveChain, useAddress, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { getEthereumAddress, getSeiEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk'
import { SHOW_ETH_ADDRESS_CHAINS } from 'config/constants'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useMemo } from 'react'

export function useGetWalletAddresses() {
  const { activeWallet } = useActiveWallet()
  const activeChain = useActiveChain()
  const address = useAddress()

  return useMemo(() => {
    if (
      activeWallet &&
      activeWallet?.walletType !== WALLETTYPE.LEDGER &&
      SHOW_ETH_ADDRESS_CHAINS.includes(activeChain)
    ) {
      const seiEvmAddress = getSeiEvmAddressToShow(activeWallet.pubKeys?.['seiDevnet'])
      const ethereumAddress =
        activeChain === 'seiDevnet' ? seiEvmAddress : getEthereumAddress(address)

      return [ethereumAddress, address]
    }
    return [address]
  }, [activeChain, address, activeWallet])
}
