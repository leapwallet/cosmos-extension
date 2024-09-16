import { Key, useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { MinusCircle } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { DISABLE_BANNER_ADS } from 'config/storage-keys'
import React from 'react'
import { Colors } from 'theme/colors'
import Browser from 'webextension-polyfill'

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

  const handleRemoveWallet = async () => {
    if (wallet) {
      await removeWallets([wallet.id])

      const storedDisabledBannerAds = await Browser.storage.local.get([DISABLE_BANNER_ADS])
      const parsedDisabledAds = JSON.parse(storedDisabledBannerAds[DISABLE_BANNER_ADS] ?? '{}')

      if (parsedDisabledAds[wallet.addresses.cosmos]) {
        delete parsedDisabledAds[wallet.addresses.cosmos]

        await Browser.storage.local.set({
          [DISABLE_BANNER_ADS]: JSON.stringify(parsedDisabledAds),
        })
      }

      onClose(true)
    }
  }

  return (
    <BottomModal
      isOpen={isVisible}
      onClose={() => onClose(false)}
      title={'Remove wallet?'}
      closeOnBackdropClick={true}
    >
      <div className='flex flex-col justify-center gap-y-[16px] items-center'>
        <div className='mt-[28px] rounded-2xl bg-white-100 dark:bg-gray-900 p-[12px] w-[48px] h-[48px] text-red-300 flex items-center justify-center'>
          <MinusCircle size={24} className='text-red-300' />
        </div>

        <Text size='md' className='font-bold w-[246px] mb-[16px] text-center'>
          Are you sure you want to remove {wallet?.name}?
        </Text>

        <div className='flex shrink w-[344px]  '>
          <Buttons.Generic
            color={Colors.getChainColor(activeChain)}
            onClick={handleRemoveWallet}
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
    </BottomModal>
  )
}
