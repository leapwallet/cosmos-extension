import {
  useActiveChain,
  useAddress,
  useChainInfo,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  getEthereumAddress,
  isEthAddress,
  pubKeyToEvmAddressToShow,
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
  const activeChainInfo = useChainInfo(activeChain)

  return useMemo(() => {
    if (
      activeWallet &&
      activeWallet?.addresses?.[activeChain] &&
      (SHOW_ETH_ADDRESS_CHAINS.includes(activeChain) || activeChainInfo?.evmOnlyChain)
    ) {
      if (!isCompassWallet() && activeChain !== 'seiTestnet2') {
        if (activeChainInfo?.evmOnlyChain) {
          return [pubKeyToEvmAddressToShow(activeWallet.pubKeys?.[activeChain])]
        }

        return [getEthereumAddress(address), address]
      } else if (isCompassWallet()) {
        if (activeWallet.walletType === WALLETTYPE.LEDGER) {
          return [address]
        }
        const evmAddress = pubKeyToEvmAddressToShow(activeWallet.pubKeys?.[activeChain])
        return isEthAddress(evmAddress) ? [evmAddress, address] : [address]
      }
    }

    return [address]
  }, [activeWallet, activeChain, activeChainInfo?.evmOnlyChain, address])
}
