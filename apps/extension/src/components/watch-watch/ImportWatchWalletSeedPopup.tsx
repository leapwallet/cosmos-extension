import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import SelectWallet from 'pages/home/SelectWallet/v2'
import React, { useState } from 'react'
import { importWatchWalletSeedPopupStore } from 'stores/import-watch-wallet-seed-popup-store'
import { Colors } from 'theme/colors'

const ImportWatchWalletSeedPopup = observer(() => {
  const { theme } = useTheme()
  const [showImportWalletSheet, setShowImportWalletSheet] = useState(false)

  if (showImportWalletSheet) {
    return (
      <SelectWallet
        isVisible={showImportWalletSheet}
        onClose={() => setShowImportWalletSheet(false)}
        title='Your Wallets'
      />
    )
  }

  return (
    <BottomModal
      isOpen={importWatchWalletSeedPopupStore.showPopup}
      onClose={() => {
        importWatchWalletSeedPopupStore.setShowPopup(false)
      }}
      closeOnBackdropClick={true}
      title={'Import wallet?'}
      className='p-6'
    >
      <div className='flex flex-col items-center gap-y-7'>
        <div className='flex flex-col items-center gap-y-4'>
          <div className='relative'>
            <img src={Images.Misc.GreenEye} width={40} height={40} />
            <img
              src={Images.Activity.TxSwapFailure}
              width={18}
              height={18}
              className='absolute top-0 left-[31px]'
            />
          </div>
          <div className='flex flex-col items-center gap-y-4'>
            <Text
              color='dark:text-gray-200 text-gray-600'
              size='md'
              className='font-bold text-center'
            >
              You are watching this wallet.
            </Text>
            <Text
              color='dark:text-gray-200 text-gray-600'
              size='md'
              className='font-medium text-center'
            >
              Import the wallet using your recovery phrase to manage assets and sign transactions.
            </Text>
          </div>
        </div>
        <Buttons.Generic
          onClick={() => {
            setShowImportWalletSheet(true)
            importWatchWalletSeedPopupStore.setShowPopup(false)
          }}
          color={theme === ThemeName.DARK ? Colors.white100 : Colors.black100}
          className='w-full'
          size='normal'
        >
          <Text color='text-white-100 dark:text-black-100'>Import now</Text>
        </Buttons.Generic>
      </div>
    </BottomModal>
  )
})

export default ImportWatchWalletSeedPopup
