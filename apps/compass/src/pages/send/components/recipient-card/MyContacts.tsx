import { SelectedAddress, sliceAddress } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Avatar } from '@leapwallet/leap-ui'
import { Compass, MagnifyingGlassMinus, PencilSimpleLine, UserList } from '@phosphor-icons/react'
import { SearchInput } from 'components/search-input'
import { useChainInfos } from 'hooks/useChainInfos'
import { useContactsSearch } from 'hooks/useContacts'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useState } from 'react'
import { AddressBook } from 'utils/addressbook'
import { cn } from 'utils/cn'

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
      avatarIcon: '',
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
    <div className='mt-2 w-full h-[calc(100%-235px)]] overflow-auto'>
      {contacts.length > 0 ? (
        contacts.map((contact, index) => {
          const chainImage = chainInfos[contact.blockchain]?.chainSymbolImageUrl ?? defaultTokenLogo
          const isLast = index === contacts.length - 1
          const isFirst = index === 0

          return (
            <React.Fragment key={contact.address}>
              <button
                className={cn('w-full flex items-center gap-3', {
                  'pb-4': isFirst && !isLast,
                  'pt-4': isLast && !isFirst,
                  'py-4': !isFirst && !isLast,
                })}
                onClick={() => handleAvatarClick(contact, chainImage)}
              >
                <div className='flex justify-between items-center w-full'>
                  <div className='flex gap-4 items-center'>
                    <img className='h-11 w-11' src={Images.Misc.getWalletIconAtIndex(1)} />

                    <div className='flex flex-col'>
                      <p className='font-bold text-left text-monochrome text-sm capitalize'>
                        {contact.name}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {sliceAddress(contact.ethAddress ? contact.ethAddress : contact.address)}
                      </p>
                    </div>
                  </div>
                  <PencilSimpleLine
                    size={34}
                    weight='fill'
                    className='bg-secondary-50 border rounded-full p-2.5 border-secondary-200 text-muted-foreground'
                  />
                </div>
              </button>

              {!isLast && <div className='border-b w-full border-secondary-300' />}
            </React.Fragment>
          )
        })
      ) : (
        <div className='py-[80px] px-4 w-full flex-col flex  justify-center items-center gap-4'>
          <MagnifyingGlassMinus
            size={64}
            className='dark:text-gray-50 text-gray-900 p-5 rounded-full bg-secondary-200'
          />
          <div className='flex flex-col justify-start items-center w-full gap-3'>
            <div className='text-lg text-center font-bold !leading-[21.5px] dark:text-white-100'>
              No contacts found
            </div>
            <div className='text-sm font-normal !leading-[22.4px] text-gray-400 dark:text-gray-400 text-center'>
              Use Compass’ in-wallet options to get started.
            </div>
            <div className='mt-2 text-sm font-medium !leading-[22.4px] text-accent-foreground text-center cursor-pointer'>
              + Add new contact
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyContacts
