import {
  SelectedAddress,
  useAddressPrefixes,
  useGetChains,
  useIsSeiEvmChain,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  getBlockChainFromAddress,
  isEthAddress,
  isValidAddressWithPrefix,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { Plus, TrashSimple } from '@phosphor-icons/react'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import { CustomCheckbox } from 'components/custom-checkbox'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useContacts } from 'hooks/useContacts'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Colors } from 'theme/colors'
import { AddressBook } from 'utils/addressbook'
import { isCompassWallet } from 'utils/isCompassWallet'

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
  showDeleteBtn?: boolean
}

export default function SaveAddressSheet({
  isOpen,
  onClose,
  address,
  ethAddress,
  onSave,
  sendActiveChain,
  showDeleteBtn,
}: SaveAddressSheetProps) {
  const [memo, setMemo] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [emoji, setEmoji] = useState<number>(1)
  const [saveAsCEX, setSaveAsCEX] = useState<boolean>(false)
  const [error, setError] = useState('')
  const [addressValue, setAddressValue] = useState('')

  const [isSaving, setIsSaving] = useState<boolean>(false)
  const { setMemo: setNewMemo, setSelectedAddress } = useSendContext() as SendContextType

  const existingContact = AddressBook.useGetContact(address)
  const { contacts: savedContacts, loading: savedContactsLoading } = useContacts()
  const addressPrefixes = useAddressPrefixes()
  const defaultTokenLogo = useDefaultTokenLogo()
  const enterNameRef = useRef<HTMLInputElement | null>(null)

  const chains = useGetChains()
  const _activeChain = useActiveChain()
  const isSeiEvmChain = useIsSeiEvmChain()

  const activeChain = useMemo(() => {
    return sendActiveChain ?? _activeChain
  }, [sendActiveChain, _activeChain])

  const chain = useMemo(() => {
    try {
      if (
        (isSeiEvmChain || chains[activeChain]?.evmOnlyChain) &&
        address.toLowerCase().startsWith('0x')
      ) {
        return activeChain
      }

      const prefix = getBlockChainFromAddress(address)
      const _chain = addressPrefixes[prefix ?? '']
      if (_chain === 'cosmoshub') {
        return 'cosmos'
      }
      return _chain as SupportedChain
    } catch (e) {
      return isCompassWallet() ? 'seiTestnet2' : 'cosmos'
    }
  }, [activeChain, address, addressPrefixes, chains, isSeiEvmChain])

  useEffect(() => {
    if (existingContact) {
      setName(existingContact.name)
      setEmoji(existingContact.emoji)
      setMemo(existingContact.memo ?? '')
      setSaveAsCEX(existingContact?.saveAsCEX ?? false)
      setAddressValue(existingContact.ethAddress || existingContact.address)
    }
  }, [existingContact])

  useEffect(() => {
    if (isValidAddressWithPrefix(address, 'sei') || isEthAddress(address)) {
      setAddressValue(address)
    }
  }, [address])

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

  const handleAddressChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    error && setError('')
    const value = event.target.value
    setAddressValue(value)
    if (value.length > 0 && !isValidAddressWithPrefix(value, 'sei') && !isEthAddress(value)) {
      setError('Invalid SEI address')
      return
    }
    if (Object.values(savedContacts).some(({ address: sCAddress }) => sCAddress === value)) {
      if (value !== (existingContact?.ethAddress || existingContact?.address)) {
        setError('Contact with same address already exists')
        return
      }
    }
  }

  const handleSubmit = async () => {
    if (name && addressValue && !isSaving) {
      setIsSaving(true)
      await AddressBook.save({
        address: addressValue,
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
        address: addressValue,
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

  const handleDelete = async () => {
    if (existingContact?.ethAddress || existingContact?.address) {
      setIsSaving(true)
      await AddressBook.removeEntry(existingContact?.ethAddress || existingContact?.address)
      setSelectedAddress(null)
      setName('')
      setMemo('')
      setSaveAsCEX(false)
      setAddressValue('')
      setIsSaving(false)
      onClose()
    }
  }

  return (
    <BottomModal
      containerClassName='bg-secondary-50'
      title={existingContact ? 'Edit Contact' : 'Add Contact'}
      onClose={onClose}
      isOpen={isOpen}
      className='!p-6'
      fullScreen={true}
      secondaryActionButton={
        showDeleteBtn ? (
          <TrashSimple
            size={48}
            className='text-muted-foreground hover:text-foreground p-3.5 cursor-pointer'
            weight='fill'
            onClick={handleDelete}
          />
        ) : null
      }
    >
      <form
        className='flex flex-col items-center w-full gap-y-4'
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
        }}
      >
        <div className='flex flex-col gap-y-5 w-full items-center'>
          <img src={Images.Misc.getWalletIconAtIndex(1)} width={80} height={80} className='mb-3' />
          <textarea
            placeholder={'enter 0x/ Sei address'}
            value={addressValue}
            onChange={handleAddressChange}
            className='h-[90px] rounded-lg placeholder:text-muted-foreground text-monochrome font-medium outline-none border border-secondary-300 hover:border-secondary-400 focus-within:!border-monochrome  bg-secondary w-full resize-none py-3 px-4 text-base'
          />
          <input
            placeholder={'enter recipient’s name'}
            value={name}
            onChange={handleNameChange}
            ref={enterNameRef}
            className='rounded-lg placeholder:text-muted-foreground text-monochrome font-medium outline-none border border-secondary-300 hover:border-secondary-400 focus-within:!border-monochrome  bg-secondary w-full resize-none py-3 px-4 text-base'
          />
          {saveAsCEX && (
            <div
              className={
                'p-5 rounded-xl bg-secondary-100 border border-secondary flex justify-between items-center dark:focus-within:border-white-100 hover:border-secondary-400 focus-within:border-black-100 w-full px-4 py-3'
              }
            >
              <input
                type='text'
                value={memo}
                placeholder='Add memo'
                className='!leading-[22.4px] bg-transparent font-medium text-sm text-monochrome placeholder:text-muted-foreground outline-none w-full'
                onChange={(e) => setMemo(e.target?.value)}
              />
              {memo.length === 0 ? (
                <Plus size={20} className='text-muted-foreground p-0.5' />
              ) : (
                <div onClick={() => setMemo('')}>
                  <Text
                    size='xs'
                    color='text-muted-foreground'
                    className=' font-bold cursor-pointer ml-2'
                  >
                    Clear
                  </Text>
                </div>
              )}
            </div>
          )}
          {error && (
            <Text size='xs' color='text-red-300' className='font-bold'>
              {error}
            </Text>
          )}
          {isSaving ? (
            <LoaderAnimation color={Colors.white100} />
          ) : (
            <Button
              className='w-full mt-3'
              disabled={!name || !addressValue || !!error || (saveAsCEX && memo.length === 0)}
              title='Save contact'
            >
              Save contact
            </Button>
          )}
          <div className='flex gap-1 w-full justify-center'>
            <CustomCheckbox
              checked={saveAsCEX}
              onClick={() => setSaveAsCEX((prevValue) => !prevValue)}
            />
            <p className='text-sm font-medium text-accent-blue'>Save as centralized exchange</p>
          </div>
        </div>
      </form>
    </BottomModal>
  )
}
