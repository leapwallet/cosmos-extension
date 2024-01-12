import { Avatar, Buttons, HeaderActionType, Input, Memo } from '@leapwallet/leap-ui'
import { Images } from 'images'
import React, { useEffect, useState } from 'react'

import BottomSheet from '~/components/bottom-sheet'
import IconButton from '~/components/icon-button'
import { Colors } from '~/theme/colors'
import { AddressBook } from '~/util/addressbook'

import { SelectedAddress } from '../types'

type SaveAddressSheetProps = {
  readonly title?: string
  readonly isVisible: boolean
  readonly onClose: VoidFunction
  readonly selectedAddress: SelectedAddress
  readonly onSave: (s: SelectedAddress) => void
}

export default function SaveAddressSheet({
  isVisible,
  onClose,
  selectedAddress,
  onSave,
  title = 'Save Address',
}: SaveAddressSheetProps) {
  const [memo, setMemo] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [emoji, setEmoji] = useState<number>(selectedAddress?.emoji)

  const [isSaving] = useState<boolean>(false)
  const contact = AddressBook.useGetContact(selectedAddress?.address)

  useEffect(() => {
    let cancel = false
    if (!name && contact) {
      if (contact) {
        if (cancel) return
        setName(contact.name)
        setMemo(contact.memo)
        setEmoji(contact.emoji)
      }
    }
    return () => {
      cancel = true
    }
  }, [name, contact])

  const subtract = (a: number) => {
    return ((a - 1) % 20) + (a >= 1 ? 0 : 20)
  }

  const add = (a: number) => {
    return (a + 1) % 20
  }

  const onClickSave = () => {
    if (name && !isSaving) {
      AddressBook.save({
        address: selectedAddress.address,
        blockchain: selectedAddress.chainName,
        emoji: emoji,
        name: name,
        memo: memo,
      })
      onSave({ ...selectedAddress, emoji: emoji, name: name })
      onClose()
    }
  }

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      headerTitle={title}
      headerActionType={HeaderActionType.CANCEL}
    >
      <>
        <div className='flex flex-col items-center w-[420px] gap-y-[16px] mt-[28px] mb-[40px]'>
          <div className=' flex flex-col gap-y-[16px] w-[344px] bg-white-100 dark:bg-gray-900 rounded-[16px] p-[12px] ml-[28px] mr-[28px] justify-center  items-center'>
            <div className='flex flex-row justify-center items-center'>
              <IconButton
                className='mx-2 p-2 rotate-180'
                onClick={() => {
                  setEmoji(subtract(emoji))
                }}
                image={{ src: Images.Misc.RightArrow, alt: 'left' }}
              />
              <Avatar size='lg' chainIcon={selectedAddress.chainIcon} emoji={emoji ?? 0} />
              <IconButton
                className='mx-2 p-2'
                onClick={() => {
                  setEmoji(add(emoji))
                }}
                image={{ src: Images.Misc.RightArrow, alt: 'right' }}
              />
            </div>
            <div className='w-[312px] flex shrink relative justify-center'>
              <Input
                width={312}
                placeholder={'enter name'}
                value={name}
                onChange={(e) => {
                  if (e.target.value.length < 24) setName(e.target.value)
                }}
              />
              <div className='absolute right-[16px] top-[14px] text-gray-400 text-sm font-medium'>{`${name.length}/24`}</div>
            </div>
          </div>
          <Memo
            value={memo}
            onChange={(e) => {
              setMemo(e.target.value)
            }}
          />
          <Buttons.Generic
            color={Colors.juno}
            size='normal'
            className='w-[344px]'
            disabled={!name}
            title='Send'
            onClick={onClickSave}
          >
            Save contact
          </Buttons.Generic>
        </div>
      </>
    </BottomSheet>
  )
}
