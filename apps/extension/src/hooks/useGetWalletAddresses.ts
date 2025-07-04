import {
  useActiveChain,
  useAddress,
  useChainInfo,
  useGetIsMinitiaEvmChain,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  getEthereumAddress,
  pubKeyToEvmAddressToShow,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { SHOW_ETH_ADDRESS_CHAINS } from 'config/constants'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useMemo } from 'react'

export function useGetWalletAddresses(forceChain?: SupportedChain) {
  const _activeChain = useActiveChain()
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])
  const selectedNetwork = useSelectedNetwork()
  const { activeWallet } = useActiveWallet()
  const address = useAddress(activeChain)
  const activeChainInfo = useChainInfo(activeChain)

  const getIsMinitias = useGetIsMinitiaEvmChain()

  return useMemo(() => {
    if (
      activeWallet &&
      activeWallet?.addresses?.[activeChain] &&
      (SHOW_ETH_ADDRESS_CHAINS.includes(activeChain) ||
        activeChainInfo?.evmOnlyChain ||
        getIsMinitias(selectedNetwork, activeChain))
    ) {
      if (activeChainInfo?.evmOnlyChain) {
        const evmAddress = pubKeyToEvmAddressToShow(activeWallet.pubKeys?.[activeChain])
        return [evmAddress]
      }

      return [getEthereumAddress(address), address]
    }

    return [address]
  }, [
    activeWallet,
    activeChain,
    activeChainInfo?.evmOnlyChain,
    address,
    selectedNetwork,
    getIsMinitias,
  ])
}
