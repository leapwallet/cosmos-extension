import { Avatar, AvatarCard, Buttons, Card } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { Images } from 'images'
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

  const stopPropagation = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation()
  }, [])

  // do not remove stopPropagation, it is needed to prevent the modal from closing when clicking on the modal itself
  // this happens due to the address input component

  return (
    <div onClick={stopPropagation}>
      <BottomModal isOpen={isOpen} onClose={onCloseHandler} title='Contact details'>
        <div className='flex flex-col items-center gap-4'>
          <AvatarCard
            chainIcon={selectedAddress.chainIcon}
            emoji={contact?.emoji ?? selectedAddress.emoji}
            size='lg'
            subtitle={`Chain: ${selectedAddress.chainName}`}
            title={contact?.name ?? selectedAddress.name}
          />
          <Buttons.CopyWalletAddress
            color={Colors.juno}
            walletAddress={sliceAddress(selectedAddress.address)}
          />
          <div className=' dark:bg-gray-900 bg-white-100 rounded-2xl  items-center'>
            <Card
              avatar={<Avatar avatarImage={Images.Misc.EditItems} size='sm' />}
              isRounded
              size='md'
              onClick={() => setShowSaveAddressSheet(true)}
              subtitle={<>Edit name and profile picture</>}
              title='Edit contact'
            />
            <Card
              avatar={<Avatar avatarImage={Images.Misc.Delete} size='sm' />}
              isRounded
              size='md'
              onClick={async () => {
                await AddressBook.removeEntry(selectedAddress.address ?? '')
                onDelete()
                onCloseHandler()
              }}
              subtitle={<>Remove {contact?.name ?? selectedAddress.name} from your contacts</>}
              title='Delete contact'
            />
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
