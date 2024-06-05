import { Images } from 'images'
import { useMemo } from 'react'

import { IMPORT_WALLET_DATA } from '../constants'

export function useGetSeedPhraseViewImgSrc(
  isPrivateKey: boolean,
  walletName: string,
  isMetamaskKey?: boolean,
  isOtherEvmWallets?: boolean,
) {
  return useMemo(() => {
    if (isMetamaskKey) {
      return Images.Logos.Metamask
    } else if (isOtherEvmWallets) {
      return Images.Misc.EvmWalletIcon
    } else if (isPrivateKey) {
      return IMPORT_WALLET_DATA.PrivateKey.imgSrc
    }

    return IMPORT_WALLET_DATA[walletName]?.imgSrc ?? Images.Misc.WalletIcon
  }, [isMetamaskKey, isOtherEvmWallets, isPrivateKey, walletName])
}
