import { SelectedAddress, sliceAddress } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { AvatarCard } from '@leapwallet/leap-ui'
import BottomModal from 'components/bottom-modal'
import { EmptyCard } from 'components/empty-card'
import { SearchInput } from 'components/search-input'
import { useChainInfos } from 'hooks/useChainInfos'
import { useContactsSearch } from 'hooks/useContacts'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useState } from 'react'
import { AddressBook } from 'utils/addressbook'

import { useSendContext } from '../../context'

type ContactsSheetProps = {
  isOpen: boolean
  onClose: () => void
  // eslint-disable-next-line no-unused-vars
  onContactSelect: (s: SelectedAddress) => void
}

export const ContactsSheet: React.FC<ContactsSheetProps> = ({
  isOpen,
  onClose,
  onContactSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const trimmedSearchQuery = searchQuery.trim()
  const contacts = useContactsSearch(trimmedSearchQuery)
  const chainInfos = useChainInfos()
  const { setMemo } = useSendContext()

  const defaultTokenLogo = useDefaultTokenLogo()

  const handleAvatarClick = (contact: AddressBook.SavedAddress, chainImage: string | undefined) => {
    onContactSelect({
      avatarIcon: undefined ?? '',
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
    <BottomModal isOpen={isOpen} closeOnBackdropClick={true} title='Contact Book' onClose={onClose}>
      <div>
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder='Search your contacts...'
        />
        <div
          className={`mt-4 bg-white-100 dark:bg-gray-900 rounded-2xl max-h-[400px] w-full ${
            contacts.length > 0 ? 'grid grid-cols-3 gap-6 p-4 justify-between' : ''
          }`}
        >
          {contacts.length > 0 ? (
            contacts.map((contact) => {
              const chainImage =
                chainInfos[contact.blockchain]?.chainSymbolImageUrl ?? defaultTokenLogo

              return (
                <AvatarCard
                  key={contact.address}
                  chainIcon={chainImage}
                  emoji={contact.emoji}
                  size='md'
                  subtitle={sliceAddress(contact.ethAddress ? contact.ethAddress : contact.address)}
                  title={contact.name}
                  onClick={() => handleAvatarClick(contact, chainImage)}
                />
              )
            })
          ) : (
            <EmptyCard
              src={
                trimmedSearchQuery.length > 0 ? Images.Misc.NoSearchResult : Images.Misc.AddContact
              }
              heading='No Contact Found'
              subHeading={
                trimmedSearchQuery.length > 0
                  ? `No contacts found for "${trimmedSearchQuery}"`
                  : `You don't have any existing contacts, add one now!`
              }
              classname='!p-6 !w-full justify-center'
            />
          )}
        </div>
      </div>
    </BottomModal>
  )
}
