import { AvatarCard, Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { SelectedAddress } from 'pages/send-v2/types'
import React, { ReactElement, useCallback, useState } from 'react'
import { Colors } from 'theme/colors'
import { AddressBook } from 'utils/addressbook'
import { sliceAddress } from 'utils/strings'

import SaveAddressSheet from '../recipient-card/save-address-sheet'

export type WalletDetailsSheetProps = {
  isOpen: boolean
  selectedAddress: SelectedAddress
  onDelete: () => void
  onCloseHandler: () => void
}

export default function WalletDetailsSheet({
  isOpen,
  onCloseHandler,
  onDelete,
  selectedAddress,
}: WalletDetailsSheetProps): ReactElement {
  const [showSaveAddressSheet, setShowSaveAddressSheet] = useState<boolean>(false)
  const contact = AddressBook.useGetContact(selectedAddress.address ?? '')
  const { theme } = useTheme()

  const stopPropagation = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
  }, [])

  // do not remove stopPropagation, it is needed to prevent the modal from closing when clicking on the modal itself
  // this happens due to the address input component

  return (
    <div onClick={stopPropagation}>
      <BottomModal
        title='Contact details'
        onClose={onCloseHandler}
        isOpen={isOpen}
        closeOnBackdropClick={true}
        contentClassName='!bg-white-100 dark:!bg-gray-950'
        className='p-6'
      >
        <div className='flex flex-col items-center gap-4'>
          <div className='w-full bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 flex items-center flex-col'>
            <AvatarCard
              chainIcon={selectedAddress.chainIcon}
              emoji={contact?.emoji ?? selectedAddress.emoji}
              size='lg'
              title={contact?.name ?? selectedAddress.name}
              className='mt-3'
            />

            <Buttons.CopyWalletAddress
              className='mt-1'
              color={Colors.juno}
              walletAddress={sliceAddress(selectedAddress.address)}
            />
          </div>

          <div className='flex gap-4 w-full'>
            <Buttons.Generic
              title='Delete contact'
              color={Colors.red300}
              onClick={async () => {
                await AddressBook.removeEntry(selectedAddress.address ?? '')
                onDelete()
                onCloseHandler()
              }}
              className='flex-1'
            >
              Delete contact
            </Buttons.Generic>

            <Buttons.Generic
              title='Edit contact'
              color={theme === ThemeName.DARK ? Colors.gray900 : '#F4F4F4'}
              onClick={() => setShowSaveAddressSheet(true)}
              className='flex-1'
            >
              <p className='!text-black-100 dark:!text-white-100'>Edit contact</p>
            </Buttons.Generic>
          </div>
        </div>
      </BottomModal>

      <SaveAddressSheet
        isOpen={showSaveAddressSheet}
        title='Edit Contact'
        address={selectedAddress.address ?? ''}
        onClose={() => setShowSaveAddressSheet(false)}
      />
    </div>
  )
}
