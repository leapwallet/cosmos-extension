import { capitalize, Key, SelectedAddress, sliceAddress } from '@leapwallet/cosmos-wallet-hooks'
import { pubKeyToEvmAddressToShow, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { EditIcon } from 'icons/edit-icon'
import { Images } from 'images'
import React, { useMemo } from 'react'
import { AddressBook } from 'utils/addressbook'

interface RecipientDisplayCardProps {
  selectedAddress: SelectedAddress
  setSelectedContact: (contact: AddressBook.SavedAddress) => void
  setIsAddContactSheetVisible: (visible: boolean) => void
  activeChain: SupportedChain
  onEdit: () => void
  wallets: Key[]
}

const RecipientDisplayCard = ({
  selectedAddress,
  setSelectedContact,
  setIsAddContactSheetVisible,
  activeChain,
  onEdit,
  wallets,
}: RecipientDisplayCardProps) => {
  const existingWallet = useMemo(() => {
    return wallets.find((wallet) => {
      const addresses = Object.values(wallet.addresses) || []
      const evmPubKey = wallet?.pubKeys?.ethereum
      const ethAddress = evmPubKey ? pubKeyToEvmAddressToShow(evmPubKey, true) : undefined
      if (ethAddress) {
        addresses.push(ethAddress)
      }
      return addresses.some((address) => {
        return (
          address &&
          (selectedAddress?.ethAddress?.toLowerCase() === address.toLowerCase() ||
            selectedAddress?.address?.toLowerCase() === address.toLowerCase())
        )
      })
    })
  }, [selectedAddress?.address, selectedAddress?.ethAddress, wallets])

  return (
    <>
      <div className='flex justify-between items-center w-full'>
        <div className='flex gap-4 items-center'>
          <img
            className='h-11 w-11 rounded-full'
            src={selectedAddress?.avatarIcon || Images.Misc.getWalletIconAtIndex(0)}
          />

          <div className='flex flex-col gap-1'>
            <p className='font-bold text-left text-monochrome text-sm'>
              {existingWallet
                ? existingWallet.name
                : selectedAddress?.name
                ? capitalize(selectedAddress?.name)
                : sliceAddress(
                    selectedAddress?.ethAddress
                      ? selectedAddress?.ethAddress
                      : selectedAddress?.address,
                  )}
            </p>
            {selectedAddress?.name ? (
              <p className='text-sm text-muted-foreground'>
                {sliceAddress(
                  selectedAddress?.ethAddress
                    ? selectedAddress?.ethAddress
                    : selectedAddress?.address,
                )}
              </p>
            ) : (
              <div
                className='bg-secondary-200 hover:bg-secondary-300 text-xs text-muted-foreground hover:text-monochrome rounded-full py-0.5 pl-1.5 pr-2 cursor-pointer'
                onClick={() => {
                  setSelectedContact({
                    address: selectedAddress?.ethAddress || selectedAddress?.address || '',
                    name: '',
                    emoji: 0,
                    blockchain: activeChain,
                    ethAddress: selectedAddress?.ethAddress || '',
                  })
                  setIsAddContactSheetVisible(true)
                }}
              >
                + Add to contacts
              </div>
            )}
          </div>
        </div>

        <EditIcon
          height={32}
          width={32}
          weight='fill'
          className='bg-secondary-300 rounded-full p-2 text-monochrome cursor-pointer'
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
        />
      </div>
    </>
  )
}

export default RecipientDisplayCard
