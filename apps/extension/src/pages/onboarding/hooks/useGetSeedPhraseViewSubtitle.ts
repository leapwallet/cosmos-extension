import { useMemo } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

export function useGetSeedPhraseViewSubtitle(
  isPrivateKey: boolean,
  walletName: string,
  isMetamaskKey?: boolean,
  isOtherEvmWallets?: boolean,
) {
  return useMemo(() => {
    if (isMetamaskKey) {
      return 'Use private key to import your MetaMask wallet to generate the same EVM address as on MetaMask.'
    } else if (isOtherEvmWallets) {
      return 'Use private key to import your EVM wallet to generate the same EVM address as on the EVM wallet.'
    } else if (isPrivateKey) {
      if (isCompassWallet()) {
        return 'Use private key to import your MetaMask (or EVM) wallet to generate the same EVM address as on MetaMask (or EVM wallet).'
      }

      return 'To import an existing wallet, please enter the private key here:'
    }

    if (isCompassWallet() && walletName.toLowerCase().trim() !== 'leap') {
      return 'Importing a recovery phrase from MetaMask might give a different address, use private key instead.'
    }

    return `To import an existing ${walletName} wallet, please enter the recovery phrase here:`
  }, [isMetamaskKey, isOtherEvmWallets, isPrivateKey, walletName])
}
