import { useActiveChain, useAddress, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import {
  getEthereumAddress,
  getSeiEvmAddressToShow,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { SHOW_ETH_ADDRESS_CHAINS } from 'config/constants'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useMemo } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

export function useGetWalletAddresses(forceChain?: SupportedChain) {
  const _activeChain = useActiveChain()
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

  const { activeWallet } = useActiveWallet()
  const address = useAddress(activeChain)

  return useMemo(() => {
    if (
      activeWallet &&
      activeWallet?.walletType !== WALLETTYPE.LEDGER &&
      SHOW_ETH_ADDRESS_CHAINS.includes(activeChain)
    ) {
      if (!isCompassWallet() && activeChain !== 'seiTestnet2') {
        return [getEthereumAddress(address), address]
      } else if (isCompassWallet()) {
        return [getSeiEvmAddressToShow(activeWallet.pubKeys?.[activeChain]), address]
      }
    }

    return [address]
  }, [activeChain, address, activeWallet])
}
