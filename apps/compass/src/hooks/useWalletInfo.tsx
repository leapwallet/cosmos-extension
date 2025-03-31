import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { EyeIcon } from 'icons/eye-icon'
import { GoogleColorIcon } from 'icons/google-color-icon'
import { Images } from 'images'
import React, { useMemo } from 'react'
import { Colors } from 'theme/colors'
import { cn } from 'utils/cn'
import { formatWalletName } from 'utils/formatWalletName'

import { Wallet } from './wallet/useWallet'

export const WatchWalletAvatar = (props: {
  colorIndex: number
  className?: string
  iconClassName?: string
}) => {
  return (
    <div
      className={cn(
        'rounded-lg bg-secondary-400 flex items-center justify-center shrink-0',
        props.className,
      )}
      style={{ backgroundColor: Colors.getWalletColorAtIndex(props.colorIndex) }}
    >
      <EyeIcon className={cn('size-5 p-0.5', props.iconClassName)} />
    </div>
  )
}

export function useWalletInfo() {
  const activeWallet = useActiveWallet()
  const socialWallets = Wallet.useSocialWallet()

  const walletAvatar = activeWallet?.watchWallet ? (
    <WatchWalletAvatar colorIndex={activeWallet?.colorIndex} />
  ) : activeWallet && socialWallets?.[activeWallet.id]?.id ? (
    <GoogleColorIcon className='size-5 rounded-full' />
  ) : (
    <img
      alt='Wallet image'
      className='size-5 rounded-full overflow-hidden'
      src={activeWallet?.avatar || Images.Logos.CompassCircle}
    />
  )

  const walletName = useMemo(() => {
    return formatWalletName(activeWallet?.name ?? '')
  }, [activeWallet?.name])

  return { walletAvatar, walletName, activeWallet }
}
