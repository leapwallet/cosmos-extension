import { Avatar, AvatarCard, Buttons, Card, HeaderActionType } from '@leapwallet/leap-ui'
import React, { ReactElement, useState } from 'react'

import BottomSheet from '~/components/bottom-sheet'
import { Images } from '~/images'
import { Colors } from '~/theme/colors'
import { AddressBook } from '~/util/addressbook'
import { sliceAddress } from '~/util/strings'

import { SelectedAddress } from '../types'
import SaveAddressSheet from './save-address-sheet'

export type WalletDetailsSheetProps = {
  isVisible: boolean
  selectedAddress: SelectedAddress
  onDelete?: () => void
  onCloseHandler?: () => void
}

export default function WalletDetailsSheet({
  isVisible,
  onCloseHandler,
  onDelete,
  selectedAddress,
}: WalletDetailsSheetProps): ReactElement {
  const [showSaveAddrSheet, setShowSaveAddrSheet] = useState<boolean>(false)
  const contact = AddressBook.useGetContact(selectedAddress.address)

  return (
    <>
      <BottomSheet
        isVisible={isVisible}
        onClose={onCloseHandler}
        headerTitle='Contact details'
        headerActionType={HeaderActionType.CANCEL}
      >
        <div className='w-screen max-w-[420px]'>
          <div className='flex flex-col items-center w-[420px] gap-y-[16px] mt-[28px] mb-[40px]'>
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
              onCopy={async () => {
                await navigator.clipboard.writeText(selectedAddress.address)
              }}
            />
            <div className=' dark:bg-gray-900 bg-white-100 rounded-2xl  items-center'>
              <Card
                avatar={<Avatar avatarImage={Images.Misc.EditItems} size='sm' />}
                isRounded
                size='md'
                onClick={() => setShowSaveAddrSheet(true)}
                subtitle={<>Edit name and profile picture</>}
                title='Edit contact'
              />
              <Card
                avatar={<Avatar avatarImage={Images.Misc.Delete} size='sm' />}
                isRounded
                size='md'
                onClick={() => {
                  AddressBook.removeEntry(selectedAddress.address)
                  onDelete && onDelete()
                  onCloseHandler()
                }}
                subtitle={<>Remove {contact?.name ?? selectedAddress.name} from your contacts</>}
                title='Delete contact'
              />
            </div>
          </div>
        </div>
      </BottomSheet>
      <SaveAddressSheet
        title='Edit Contact'
        isVisible={showSaveAddrSheet}
        selectedAddress={selectedAddress}
        onSave={() => AddressBook.save(contact)}
        onClose={() => setShowSaveAddrSheet(false)}
      />
    </>
  )
}
