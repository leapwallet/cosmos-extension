import { SelectedAddress, useAddressPrefixes } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Avatar, Buttons, Input, Memo } from '@leapwallet/leap-ui'
import bech32 from 'bech32'
import BottomModal from 'components/bottom-modal'
import IconButton from 'components/icon-button'
import { LoaderAnimation } from 'components/loader/Loader'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import { getChainImage } from 'images/logos'
import React, { useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import { AddressBook } from 'utils/addressbook'
import { isCompassWallet } from 'utils/isCompassWallet'

import { SendContextType, useSendContext } from '../../context'

type SaveAddressSheetProps = {
  title?: string
  isOpen: boolean
  address: string
  onClose: () => void
  // eslint-disable-next-line no-unused-vars
  onSave?: (s: SelectedAddress) => void
}

const subtract = (a: number) => {
  return ((a - 1) % 20) + (a >= 1 ? 0 : 20)
}

const add = (a: number) => {
  return (a + 1) % 20
}

export default function SaveAddressSheet({
  title = 'Save Contact',
  isOpen,
  onClose,
  address,
  onSave,
}: SaveAddressSheetProps) {
  const [memo, setMemo] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [emoji, setEmoji] = useState<number>(1)

  const [isSaving, setIsSaving] = useState<boolean>(false)
  const { setMemo: setNewMemo } = useSendContext() as SendContextType

  const existingContact = AddressBook.useGetContact(address)
  const chainInfos = useChainInfos()
  const addressPrefixes = useAddressPrefixes()

  const chain = useMemo(() => {
    try {
      const { prefix } = bech32.decode(address)
      const _chain = addressPrefixes[prefix]
      if (_chain === 'cosmoshub') {
        return 'cosmos'
      }
      return _chain as SupportedChain
    } catch (e) {
      return 'cosmos'
    }
  }, [address, addressPrefixes])

  const chainIcon = getChainImage(chain)

  useEffect(() => {
    if (existingContact) {
      setName(existingContact.name)
      setEmoji(existingContact.emoji)
      setMemo(existingContact.memo ?? '')
    }
  }, [existingContact])

  const onClickSave = async () => {
    if (name && !isSaving) {
      setIsSaving(true)
      await AddressBook.save({
        address: address,
        blockchain: chain,
        emoji: emoji,
        name: name,
        memo: memo,
      })

      setNewMemo(memo)
      onSave?.({
        address: address,
        chainIcon: chainIcon ?? '',
        emoji: emoji,
        name: name,
        avatarIcon: undefined ?? '',
        chainName: chainInfos[chain].chainName,
        selectionType: 'saved',
      })
      onClose()
      setIsSaving(false)
    }
  }

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title={title} closeOnBackdropClick={true}>
      <div className='flex flex-col items-center w-full gap-y-4'>
        <div className='flex flex-col gap-y-4 w-full bg-white-100 dark:bg-gray-900 rounded-2xl p-3 justify-center  items-center'>
          <div className='flex flex-row justify-center items-center'>
            <IconButton
              className='mx-2 p-2 rotate-180'
              onClick={() => {
                setEmoji(subtract(emoji))
              }}
              image={{ src: Images.Misc.RightArrow, alt: 'left' }}
            />
            <Avatar size='lg' chainIcon={chainIcon} emoji={emoji ?? 0} />
            <IconButton
              className='mx-2 p-2'
              onClick={() => {
                setEmoji(add(emoji))
              }}
              image={{ src: Images.Misc.RightArrow, alt: 'right' }}
            />
          </div>
          <div className='w-full flex shrink relative justify-center'>
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
        {isSaving ? (
          <LoaderAnimation color={Colors.white100} />
        ) : (
          <Buttons.Generic
            color={isCompassWallet() ? Colors.compassPrimary : Colors.juno}
            size='normal'
            className='w-full'
            disabled={!name}
            title='Send'
            onClick={async () => {
              await onClickSave()
            }}
          >
            Save contact
          </Buttons.Generic>
        )}
      </div>
    </BottomModal>
  )
}
