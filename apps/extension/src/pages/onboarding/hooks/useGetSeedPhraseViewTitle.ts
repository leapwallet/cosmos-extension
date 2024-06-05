import { useMemo } from 'react'

export function useGetSeedPhraseViewTitle(
  isPrivateKey: boolean,
  walletName: string,
  isMetamaskKey?: boolean,
  isOtherEvmWallets?: boolean,
) {
  return useMemo(() => {
    let _title = 'Import'

    if (isMetamaskKey) {
      _title += ' via MetaMask'
    } else if (isOtherEvmWallets) {
      _title += ' via EVM Wallet'
    } else if (isPrivateKey) {
      _title += ' via Private Key'
    } else if (walletName) {
      _title += ` ${walletName}`
    } else if (!walletName) {
      _title += ' via Recovery Phrase'
    }

    return _title
  }, [isMetamaskKey, isOtherEvmWallets, isPrivateKey, walletName])
}
