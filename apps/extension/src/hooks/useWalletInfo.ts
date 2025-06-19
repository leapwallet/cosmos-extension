import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { Images } from 'images'
import { useMemo } from 'react'
import { formatWalletName } from 'utils/formatWalletName'

export function useWalletInfo() {
  const activeWallet = useActiveWallet()

  const walletAvatar = useMemo(() => {
    if (activeWallet?.avatar) {
      return activeWallet.avatar
    }

    return Images.Logos.LeapLogo28
  }, [activeWallet?.avatar])

  const walletName = useMemo(() => {
    return formatWalletName(activeWallet?.name ?? '')
  }, [activeWallet?.name])

  return { walletAvatar, walletName, activeWallet }
}
