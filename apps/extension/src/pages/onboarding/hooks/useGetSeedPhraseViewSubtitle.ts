import { useMemo } from 'react'

export function useGetSeedPhraseViewSubtitle(
  isPrivateKey: boolean,
  walletName: string,
  isMetamaskKey?: boolean,
  isOtherEvmWallets?: boolean,
) {
  return useMemo(() => {
    if (isMetamaskKey) {
      return 'To import an existing MetaMask wallet, please enter the private key here:'
    } else if (isOtherEvmWallets) {
      return 'To import an existing EVM wallet, please enter the private key here:'
    } else if (isPrivateKey) {
      return 'To import an existing wallet, please enter the private key here:'
    }

    return `To import an existing ${walletName} wallet, please enter the recovery phrase here:`
  }, [isMetamaskKey, isOtherEvmWallets, isPrivateKey, walletName])
}
