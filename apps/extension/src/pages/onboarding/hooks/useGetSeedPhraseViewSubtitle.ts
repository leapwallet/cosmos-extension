import { useMemo } from 'react'

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
      return 'To import an existing wallet, please enter the private key here:'
    }

    return `To import an existing ${walletName} wallet, please enter the recovery phrase here:`
  }, [isMetamaskKey, isOtherEvmWallets, isPrivateKey, walletName])
}
