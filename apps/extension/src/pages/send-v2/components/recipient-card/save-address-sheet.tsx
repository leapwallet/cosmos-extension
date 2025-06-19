import { SelectedAddress, useAddressPrefixes, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { getBlockChainFromAddress, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Avatar, Buttons, Input } from '@leapwallet/leap-ui'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { CustomCheckbox } from 'components/custom-checkbox'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useContacts } from 'hooks/useContacts'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Colors } from 'theme/colors'
import { AddressBook } from 'utils/addressbook'
import { sliceAddress } from 'utils/strings'

import { SendContextType, useSendContext } from '../../context'

type SaveAddressSheetProps = {
  title?: string
  isOpen: boolean
  address: string
  ethAddress?: string
  sendActiveChain?: SupportedChain
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
  ethAddress,
  onSave,
  sendActiveChain,
}: SaveAddressSheetProps) {
  const [memo, setMemo] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [emoji, setEmoji] = useState<number>(1)
  const [saveAsCEX, setSaveAsCEX] = useState<boolean>(false)
  const [error, setError] = useState('')

  const [isSaving, setIsSaving] = useState<boolean>(false)
  const { setMemo: setNewMemo } = useSendContext() as SendContextType

  const existingContact = AddressBook.useGetContact(address)
  const { contacts: savedContacts, loading: savedContactsLoading } = useContacts()
  const addressPrefixes = useAddressPrefixes()
  const defaultTokenLogo = useDefaultTokenLogo()
  const enterNameRef = useRef<HTMLInputElement | null>(null)

  const chains = useGetChains()
  const _activeChain = useActiveChain()

  const activeChain = useMemo(() => {
    return sendActiveChain ?? _activeChain
  }, [sendActiveChain, _activeChain])

  const chain = useMemo(() => {
    try {
      if (chains[activeChain]?.evmOnlyChain && address.toLowerCase().startsWith('0x')) {
        return activeChain
      }

      const prefix = getBlockChainFromAddress(address)
      const _chain = addressPrefixes[prefix ?? '']
      if (_chain === 'cosmoshub') {
        return 'cosmos'
      }
      return _chain as SupportedChain
    } catch (e) {
      return 'cosmos'
    }
  }, [activeChain, address, addressPrefixes, chains])

  useEffect(() => {
    if (existingContact) {
      setName(existingContact.name)
      setEmoji(existingContact.emoji)
      setMemo(existingContact.memo ?? '')
      setSaveAsCEX(existingContact?.saveAsCEX ?? false)
    }
  }, [existingContact])

  useEffect(() => {
    if (isOpen && enterNameRef.current) {
      enterNameRef.current.focus()
    }
  }, [isOpen])

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    error && setError('')
    const value = event.target.value

    if (value.length < 24) {
      if (
        value.length &&
        !savedContactsLoading &&
        Object.values(savedContacts).some(
          ({ name, address: sCAddress }) =>
            sCAddress !== address && name.trim().toLowerCase() === value.trim().toLowerCase(),
        )
      ) {
        setError('Contact with same name already exists')
      }

      setName(value)
    }
  }

  const handleSubmit = async () => {
    if (name && !isSaving) {
      setIsSaving(true)
      await AddressBook.save({
        address: address,
        blockchain: chain,
        emoji: emoji,
        name: name,
        memo: memo,
        ethAddress,
        saveAsCEX: saveAsCEX,
      })

      setNewMemo(memo)
      onSave?.({
        ethAddress,
        address: address,
        chainIcon: chains[chain]?.chainSymbolImageUrl ?? defaultTokenLogo ?? '',
        emoji: emoji,
        name: name,
        avatarIcon: '',
        chainName: chains[chain]?.chainName,
        selectionType: 'saved',
      })
      onClose()
      setIsSaving(false)
    }
  }

  return (
    <BottomModal
      title={title}
      onClose={onClose}
      isOpen={isOpen}
      closeOnBackdropClick={true}
      containerClassName='!max-panel-height'
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='p-6'
    >
      <form
        className='flex flex-col items-center w-full gap-y-4'
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
        }}
      >
        <div className='flex flex-col gap-y-4 w-full bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 justify-center items-center'>
          <div className='flex flex-row justify-center items-center gap-5'>
            <div
              className='p-1 bg-gray-100 dark:bg-gray-850 rounded-full cursor-pointer'
              onClick={() => setEmoji(subtract(emoji))}
            >
              <CaretLeft size={32} className='text-black-100 dark:text-white-100' />
            </div>
            <Avatar
              size='lg'
              chainIcon={chains[chain]?.chainSymbolImageUrl ?? defaultTokenLogo}
              emoji={emoji ?? 0}
            />
            <div
              className='p-1 bg-gray-100 dark:bg-gray-850 rounded-full cursor-pointer'
              onClick={() => setEmoji(add(emoji))}
            >
              <CaretRight size={32} className='text-black-100 dark:text-white-100' />
            </div>
          </div>

          <p className='text-gray-600 dark:text-gray-400 font-bold'>{sliceAddress(address)}</p>

          <div className='w-full'>
            <div className='w-full flex shrink relative justify-center'>
              <Input
                placeholder={'Enter name'}
                value={name}
                onChange={handleNameChange}
                ref={enterNameRef}
                className='h-12 rounded-xl placeholder:text-gray-600 dark:placeholder:text-gray-400 text-black-100 dark:text-white-100 outline-none border !border-[transparent] focus-within:!border-green-600 !bg-gray-100 dark:!bg-gray-850'
              />
              <div className='absolute right-[16px] top-[14px] text-gray-400 text-sm font-medium'>{`${name.length}/24`}</div>
            </div>

            {error && (
              <Text size='xs' color='text-red-300' className='mt-2 ml-1 font-bold'>
                {error}
              </Text>
            )}
          </div>
        </div>

        {chains[chain]?.evmOnlyChain ? null : (
          <>
            <div className='p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 w-full'>
              <p className='font-medium text-sm text-gray-600 dark:text-gray-400 mb-3'>Add Memo</p>
              <input
                type='text'
                value={memo}
                placeholder='Required for CEX transfers...'
                className='w-full h-10 rounded-xl px-4 py-2 font-medium text-sm placeholder:text-gray-600 dark:placeholder:text-gray-400 text-black-100 dark:text-white-100 outline-none border border-[transparent] focus-within:border-green-600 bg-gray-100 dark:bg-gray-850'
                onChange={(e) => setMemo(e.target?.value)}
              />
            </div>

            <div className='flex gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 w-full'>
              <CustomCheckbox
                checked={saveAsCEX}
                onClick={() => setSaveAsCEX((prevValue) => !prevValue)}
              />
              <p className='text-sm font-medium text-gray-800 dark:text-gray-200'>
                Save as Centralized Exchange Address
              </p>
            </div>
          </>
        )}

        {isSaving ? (
          <LoaderAnimation color={Colors.white100} />
        ) : (
          <Buttons.Generic
            color={Colors.green600}
            size='normal'
            className='w-full'
            disabled={!name || !!error}
            title='Save contact'
            type='submit'
          >
            Save contact
          </Buttons.Generic>
        )}
      </form>
    </BottomModal>
  )
}
