import { Key, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, HeaderActionType, ThemeName, useTheme } from '@leapwallet/leap-ui'
import React from 'react'
import { Colors } from 'theme/colors'

import BottomSheet from '../../components/bottom-sheet/BottomSheet'
import Text from '../../components/text'
import { Wallet } from '../../hooks/wallet/useWallet'

type EditWalletFormProps = {
  wallet: Key
  isVisible: boolean
  // eslint-disable-next-line no-unused-vars
  onClose: (closeParent: boolean) => void
}

export function RemoveWallet({ isVisible, wallet, onClose }: EditWalletFormProps) {
  const activeChain = useActiveChain()
  const isDark = useTheme().theme === ThemeName.DARK
  const { removeWallets } = Wallet.useRemoveWallet()

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={() => onClose(false)}
      headerTitle={'Remove wallet?'}
      headerActionType={HeaderActionType.CANCEL}
      closeOnClickBackDrop={true}
    >
      <div className='flex flex-col  justify-center gap-y-[16px] items-center p-[28px]'>
        <div className='mt-[28px] rounded-2xl bg-white-100 dark:bg-gray-900 p-[12px] w-[48px] h-[48px] text-red-300 material-icons-round'>
          remove_circle
        </div>

        <Text size='md' className='font-bold w-[246px] mb-[16px] text-center'>
          Are you sure you want to remove {wallet?.name}?
        </Text>

        <div className='flex shrink w-[344px]  '>
          <Buttons.Generic
            color={Colors.getChainColor(activeChain)}
            onClick={async () => {
              if (wallet) {
                await removeWallets([wallet.id])
                onClose(true)
              }
            }}
            data-testing-id='btn-remove-wallet'
          >
            Remove
          </Buttons.Generic>
        </div>
        <div className='flex shrink w-[344px]'>
          <Buttons.Generic
            color={isDark ? Colors.gray900 : Colors.gray400}
            onClick={async () => {
              onClose(false)
            }}
          >
            Don&apos;t Remove
          </Buttons.Generic>
        </div>
      </div>
    </BottomSheet>
  )
}
