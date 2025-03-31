import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { Eye } from '@phosphor-icons/react'
import classNames from 'classnames'
import Text from 'components/text'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import React from 'react'
import { Colors } from 'theme/colors'

export const WatchingWalletStrip = () => {
  const { activeWallet } = useActiveWallet()
  const { theme } = useTheme()

  if (!activeWallet?.watchWallet) return null
  return (
    <div
      className={classNames(
        'flex items-center gap-x-2 w-full justify-center h-[36px] sticky top-[72px] bg-white-100 dark:bg-gray-950 z-20',
      )}
    >
      <Eye size={17} color={ThemeName.DARK === theme ? Colors.white100 : Colors.black100} />
      <Text size='xs' className={`font-bold text-center`}>
        You are watching this wallet
      </Text>
    </div>
  )
}
