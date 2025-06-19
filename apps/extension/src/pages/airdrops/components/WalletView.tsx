import Text from 'components/text'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Images } from 'images'
import React, { useMemo } from 'react'
import { formatWalletName } from 'utils/formatWalletName'
import { trim } from 'utils/strings'

export default function WalletView() {
  const { activeWallet } = useActiveWallet()
  const walletName = formatWalletName(activeWallet?.name || '')

  const walletAvatar = useMemo(() => {
    if (activeWallet?.avatar) {
      return activeWallet.avatar
    }

    return
  }, [activeWallet?.avatar])

  return (
    <div className='flex items-center justify-between bg-secondary-100 pl-4 rounded-xl py-[10px]'>
      <Text size='sm' className='font-medium'>
        Airdrops shown for
      </Text>
      <div className='flex items-center gap-2 py-2 pl-3 pr-4 bg-gray-50 dark:bg-gray-900 rounded-[30px]'>
        {walletAvatar ? (
          <img className='w-5 h-5 rounded-full' src={walletAvatar} alt='wallet-avatar' />
        ) : (
          <img className='w-5 h-5' src={Images.Logos.LeapLogo28} alt='wallet-avatar' />
        )}
        <Text size='sm' className='font-bold'>
          {trim(walletName, 10)}
        </Text>
      </div>
    </div>
  )
}
