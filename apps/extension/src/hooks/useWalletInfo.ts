import { useActiveWallet, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { walletLabels } from 'config/constants'
import { Images } from 'images'
import { useMemo } from 'react'
import { formatWalletName } from 'utils/formatWalletName'
import { isCompassWallet } from 'utils/isCompassWallet'

export function useWalletInfo() {
  const activeWallet = useActiveWallet()

  const walletAvatar = useMemo(() => {
    if (activeWallet?.avatar) {
      return activeWallet.avatar
    }

    if (isCompassWallet()) {
      return Images.Logos.CompassCircle
    }

    return Images.Logos.LeapLogo28
  }, [activeWallet?.avatar])

  const walletName = useMemo(() => {
    if (
      activeWallet?.walletType === WALLETTYPE.LEDGER &&
      !LEDGER_NAME_EDITED_SUFFIX_REGEX.test(activeWallet?.name)
    ) {
      return `${walletLabels[activeWallet?.walletType]} Wallet ${activeWallet?.addressIndex + 1}`
    }

    return formatWalletName(activeWallet?.name ?? '')
  }, [activeWallet?.addressIndex, activeWallet?.name, activeWallet?.walletType])

  return { walletAvatar, walletName, activeWallet }
}
