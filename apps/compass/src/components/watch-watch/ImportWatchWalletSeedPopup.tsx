import BottomModal from 'components/bottom-modal'
import { Button } from 'components/ui/button'
import { EyeIcon } from 'icons/eye-icon'
import { observer } from 'mobx-react-lite'
import CreateImportActions from 'pages/home/SelectWallet/CreateImportActions'
import React, { useState } from 'react'
import { globalSheetsStore } from 'stores/ui/global-sheets-store'

const ImportWatchWalletSeedPopup = observer(() => {
  const [showImportWalletSheet, setShowImportWalletSheet] = useState(false)

  return (
    <>
      <BottomModal
        isOpen={globalSheetsStore.importWatchWalletSeedPopupOpen}
        onClose={() => {
          globalSheetsStore.setImportWatchWalletSeedPopupOpen(false)
        }}
        title={'Import wallet'}
        className='p-6'
        footerComponent={
          <Button
            onClick={() => {
              setShowImportWalletSheet(true)
              globalSheetsStore.setImportWatchWalletSeedPopupOpen(false)
            }}
            className='w-full'
            size={'md'}
          >
            Import now
          </Button>
        }
      >
        <div className='flex flex-col items-center gap-4'>
          <div className='relative size-20 grid place-content-center rounded-full bg-secondary-300'>
            <EyeIcon className='size-10 text-muted-foreground' />
          </div>
          <span className='text-sm font-medium text-center'>You are watching this wallet.</span>
          <span className='text-md font-medium text-center'>
            Import the wallet using your recovery phrase to manage assets and sign transactions.
          </span>
        </div>
      </BottomModal>

      <CreateImportActions
        title='Add / Connect Wallet'
        isVisible={showImportWalletSheet}
        onClose={() => {
          setShowImportWalletSheet(false)
        }}
      />
    </>
  )
})

export default ImportWatchWalletSeedPopup
