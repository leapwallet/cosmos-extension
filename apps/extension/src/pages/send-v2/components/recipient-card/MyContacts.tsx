import { SelectedAddress, sliceAddress } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Avatar } from '@leapwallet/leap-ui'
import { UserList } from '@phosphor-icons/react'
import { SearchInput } from 'components/ui/input/search-input'
import { useChainInfos } from 'hooks/useChainInfos'
import { useContactsSearch } from 'hooks/useContacts'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React, { useState } from 'react'
import { AddressBook } from 'utils/addressbook'

import { useSendContext } from '../../context'

interface MyContactsProps {
  handleContactSelect: (contact: SelectedAddress) => void
}

function MyContacts({ handleContactSelect }: MyContactsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const trimmedSearchQuery = searchQuery.trim()
  const contacts = useContactsSearch(trimmedSearchQuery)
  const chainInfos = useChainInfos()
  const { setMemo } = useSendContext()
  const defaultTokenLogo = useDefaultTokenLogo()

  const handleAvatarClick = (contact: AddressBook.SavedAddress, chainImage: string | undefined) => {
    handleContactSelect({
      avatarIcon: undefined,
      chainIcon: chainImage ?? '',
      chainName: chainInfos[contact.blockchain as SupportedChain].chainName,
      name: contact.name,
      address: contact.address,
      emoji: contact.emoji,
      selectionType: 'saved',
    })
    setMemo(contact.memo ?? '')
  }

  return (
    <>
      <SearchInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onClear={() => setSearchQuery('')}
        placeholder='Search your contacts...'
      />

      <div className='mt-4 w-full h-[calc(100%-300px)]] overflow-auto'>
        {contacts.length > 0 ? (
          contacts.map((contact, index) => {
            const chainImage =
              chainInfos[contact.blockchain]?.chainSymbolImageUrl ?? defaultTokenLogo
            const isLast = index === contacts.length - 1

            return (
              <React.Fragment key={contact.address}>
                <button
                  className='w-full flex items-center gap-3 py-3'
                  onClick={() => handleAvatarClick(contact, chainImage)}
                >
                  <Avatar chainIcon={chainImage} emoji={contact.emoji ?? 0} />

                  <div>
                    <p className='font-bold text-left dark:text-white-100 text-gray-700 capitalize'>
                      {contact.name}
                    </p>

                    <p className='text-sm font-medium dark:text-gray-400 text-gray-600'>
                      {sliceAddress(contact.ethAddress ? contact.ethAddress : contact.address)}
                    </p>
                  </div>
                </button>

                {!isLast && (
                  <div className='border-b w-full border-gray-100 dark:border-gray-850' />
                )}
              </React.Fragment>
            )
          })
        ) : (
          <div className='py-[88px] w-full flex-col flex  justify-center items-center gap-4'>
            <UserList size={40} className='text-black-100 dark:text-white-100 !leading-[40px]' />

            <div className='flex flex-col justify-start items-center w-full gap-1'>
              <div className='text-md text-center font-bold !leading-[21.5px] dark:text-white-100'>
                {trimmedSearchQuery.length > 0
                  ? `No contacts found for "${trimmedSearchQuery}"`
                  : `No contacts to show`}
              </div>

              <div className='text-sm font-normal !leading-[22.4px] text-gray-400 dark:text-gray-400'>
                {trimmedSearchQuery.length > 0
                  ? `Try searching for a different term `
                  : `Add a contact see them appear here`}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default MyContacts
