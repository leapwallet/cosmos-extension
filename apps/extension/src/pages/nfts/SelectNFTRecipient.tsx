import {
  SelectedAddress,
  sliceAddress,
  useAddress,
  useAddressPrefixes,
  useChainInfo,
} from '@leapwallet/cosmos-wallet-hooks'
import { isValidAddressWithPrefix, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { CaretRight, Compass, PencilSimpleLine } from '@phosphor-icons/react'
import { bech32 } from 'bech32'
import classNames from 'classnames'
import { CtaInput } from 'components/cta-input'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { useDefaultTokenLogo } from 'hooks'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { useContacts, useContactsSearch } from 'hooks/useContacts'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AddressBook } from 'utils/addressbook'
import { UserClipboard } from 'utils/clipboard'
import { cn } from 'utils/cn'

import { NftDetailsType } from './context'
import { useNFTSendContext } from './send-nft/context'

function MyWallets({
  setSelectedAddress,
}: {
  setSelectedAddress: (address: SelectedAddress) => void
}) {
  const activeChain: SupportedChain = 'mainCoreum'
  const { activeWallet } = useActiveWallet()
  const wallets = Wallet.useWallets()

  const walletsList = useMemo(() => {
    return wallets
      ? Object.values(wallets)
          .map((wallet) => wallet)
          .filter((wallet) => wallet.id !== activeWallet?.id)
          .sort((a, b) => a.name.localeCompare(b.name))
      : []
  }, [activeWallet?.id, wallets])

  return (
    <div className='relative mt-2 w-full h-[calc(100%-235px)]] overflow-auto'>
      {walletsList.length > 0 ? (
        walletsList.map((wallet, index) => {
          const isLast = index === walletsList.length - 1
          const isFirst = index === 0

          const addressText = wallet?.addresses?.[activeChain]
          return (
            <React.Fragment key={wallet.id}>
              <button
                className={classNames('w-full flex items-center gap-3 cursor-pointer', {
                  '!cursor-not-allowed opacity-50': !addressText,
                  'pb-4': isFirst && !isLast,
                  'pt-4': isLast && !isFirst,
                  'py-4': !isFirst && !isLast,
                })}
                onClick={() => {
                  setSelectedAddress({
                    address: addressText,
                    avatarIcon: Images.Misc.getWalletIconAtIndex(wallet.colorIndex),
                    chainIcon: '',
                    chainName: activeChain,
                    emoji: undefined,
                    name: `${
                      wallet.name.length > 12 ? `${wallet.name.slice(0, 12)}...` : wallet.name
                    }`,
                    selectionType: 'currentWallet',
                  })
                }}
                disabled={!addressText}
              >
                <div className='flex gap-4 items-center'>
                  <img className='h-11 w-11' src={Images.Misc.getWalletIconAtIndex(0)} />

                  <div className='flex flex-col'>
                    <p className='font-bold text-left text-monochrome text-sm capitalize'>
                      {wallet.name}
                    </p>
                    <p className='text-sm text-muted-foreground'>{sliceAddress(addressText)}</p>
                  </div>
                </div>
              </button>

              {!isLast && <div className='border-b w-full border-gray-100 dark:border-gray-850' />}
            </React.Fragment>
          )
        })
      ) : (
        <div className='py-[80px] px-4 w-full flex-col flex  justify-center items-center gap-4'>
          <Compass
            size={56}
            className=' dark:text-gray-400 text-gray-600 p-2 rounded-full dark:bg-gray-850 bg-gray-100'
          />
          <div className='flex flex-col justify-start items-center w-full gap-3'>
            <div className='text-lg text-center font-bold !leading-[21.5px] dark:text-white-100'>
              No wallets found
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MyContacts({
  handleContactSelect,
  editContact,
}: {
  handleContactSelect: (contact: SelectedAddress) => void
  editContact: (s?: AddressBook.SavedAddress) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const trimmedSearchQuery = searchQuery.trim()
  const _contacts = useContactsSearch(trimmedSearchQuery)
  const contacts = _contacts.filter((contact) => contact.blockchain === 'mainCoreum')
  const chainInfos = useChainInfos()
  const { chainName } = useChainInfo('mainCoreum')
  const defaultTokenLogo = useDefaultTokenLogo()

  const handleAvatarClick = (contact: AddressBook.SavedAddress, chainImage: string | undefined) => {
    handleContactSelect({
      avatarIcon: '',
      chainIcon: chainImage ?? '',
      chainName: chainName,
      name: contact.name,
      address: contact.address,
      emoji: contact.emoji,
      selectionType: 'saved',
    })
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
                    <img className='h-11 w-11' src={Images.Misc.getWalletIconAtIndex(0)} />

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
                    className='bg-secondary-50 border rounded-full p-2.5 border-secondary-200 text-muted-foreground cursor-pointer'
                    onClick={(e) => {
                      e.stopPropagation()
                      editContact(contact)
                    }}
                  />
                </div>
              </button>

              {!isLast && <div className='border-b w-full border-secondary-300' />}
            </React.Fragment>
          )
        })
      ) : (
        <div className='py-[80px] px-4 w-full flex-col flex  justify-center items-center gap-4'>
          <Compass
            size={56}
            className=' dark:text-gray-400 text-gray-600 p-2 rounded-full dark:bg-gray-850 bg-gray-100'
          />
          <div className='flex flex-col justify-start items-center w-full gap-3'>
            <div className='text-lg text-center font-bold !leading-[21.5px] dark:text-white-100'>
              No contacts found
            </div>
            <div
              className='mt-2 text-sm font-medium !leading-[22.4px] text-accent-foreground text-center cursor-pointer'
              onClick={(e) => {
                e.stopPropagation()
                editContact()
              }}
            >
              + Add new contact
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const SelectNFTRecipient = observer(
  ({
    isOpen,
    onClose,
    setShowReviewSheet,
    nftDetails,
    editContact,
  }: {
    isOpen: boolean
    onClose: () => void
    setShowReviewSheet: (val: boolean) => void
    nftDetails: NftDetailsType
    editContact: (s?: AddressBook.SavedAddress) => void
  }) => {
    const [recipientInputValue, setRecipientInputValue] = useState<string>('')
    const existingContactMatch = AddressBook.useGetContact(recipientInputValue)
    const [addressError, setAddressError] = useState<string>()
    const activeChain: SupportedChain = 'mainCoreum'

    const { setReceiverAddress, setCollectionAddress, collectionAddress, receiverAddress } =
      useNFTSendContext()
    const currentWalletAddress = useAddress(activeChain)
    const addressPrefixes = useAddressPrefixes()
    const activeChainInfo = useChainInfo()
    const [selectedTab, setSelectedTab] = useState<'contacts' | 'wallets'>('contacts')
    const { contacts, loading: loadingContacts } = useContacts()
    const { activeWallet } = useActiveWallet()
    const wallets = Wallet.useWallets()

    const walletsList = useMemo(() => {
      return wallets
        ? Object.values(wallets)
            .map((wallet) => wallet)
            .filter((wallet) => wallet.id !== activeWallet?.id)
            .sort((a, b) =>
              a.createdAt && b.createdAt
                ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                : a.name.localeCompare(b.name),
            )
        : []
    }, [activeWallet?.id, wallets])

    const existingWalletMatch = useMemo(() => {
      const res = walletsList.find((wallet) => {
        return Object.values(wallet.addresses).some((address) => {
          return recipientInputValue.toLowerCase() === address.toLowerCase()
        })
      })
      if (res) return res
    }, [recipientInputValue, walletsList])

    const existingResult = existingContactMatch ?? existingWalletMatch

    const actionPaste = () => {
      UserClipboard.pasteText().then((text) => {
        if (!text) return
        setRecipientInputValue(text.trim())
      })
    }

    const allowReview = useCallback(() => {
      if (!addressError) {
        setShowReviewSheet(true)
        onClose()
      }
    }, [addressError, onClose, setShowReviewSheet])

    const handleContactSelect = useCallback(
      (s: SelectedAddress) => {
        setReceiverAddress(s)
        setRecipientInputValue(s.address ?? '')
        allowReview()
      },
      [allowReview, setReceiverAddress],
    )

    const handleWalletSelect = useCallback(
      (s: SelectedAddress) => {
        setAddressError(undefined)
        setRecipientInputValue(s.address ?? '')
        setReceiverAddress(s)
        allowReview()
      },
      [allowReview, setReceiverAddress],
    )

    useEffect(() => {
      if (!loadingContacts) {
        if (Object.keys(contacts).length === 0) {
          setSelectedTab('wallets')
        }
      }
    }, [contacts, loadingContacts])

    useEffect(() => {
      setCollectionAddress(nftDetails?.collection.address ?? '')
    }, [nftDetails?.collection.address, setCollectionAddress])

    useEffect(() => {
      ;(async function () {
        if (
          recipientInputValue.length > 0 &&
          !isValidAddressWithPrefix(recipientInputValue, 'core')
        ) {
          setAddressError('Invalid address')
          return
        } else {
          setAddressError('')
        }

        if (currentWalletAddress === recipientInputValue) {
          setAddressError('Cannot send to self')
        } else {
          setAddressError('')
        }
      })()
    }, [collectionAddress, currentWalletAddress, recipientInputValue, setAddressError, activeChain])

    useEffect(() => {
      if (recipientInputValue === receiverAddress?.address) {
        return
      }
      const cleanInputValue = recipientInputValue.trim()
      if (receiverAddress && cleanInputValue !== receiverAddress.address) {
        setReceiverAddress(null)
        return
      }
      try {
        const { prefix } = bech32.decode(cleanInputValue)
        const _chain = addressPrefixes[prefix] as SupportedChain
        if (_chain !== 'mainCoreum') return
        const img = activeChainInfo.chainSymbolImageUrl ?? ''

        setReceiverAddress({
          address: cleanInputValue,
          name: sliceAddress(cleanInputValue),
          avatarIcon: img ?? '',
          emoji: undefined,
          chainIcon: img ?? '',
          chainName: _chain,
          selectionType: 'notSaved',
        })
      } catch (err) {
        //
      }
    }, [
      activeChainInfo.chainSymbolImageUrl,
      activeChainInfo.key,
      addressPrefixes,
      collectionAddress,
      receiverAddress,
      recipientInputValue,
      setReceiverAddress,
    ])

    return (
      <>
        <BottomModal
          isOpen={isOpen}
          onClose={onClose}
          fullScreen
          title='Select Recipient'
          className='h-full'
        >
          <div className='flex flex-col items-start gap-5 w-full h-full'>
            <div className='flex flex-col items-center w-full'>
              <CtaInput
                value={recipientInputValue}
                action={'Paste'}
                actionHandler={actionPaste}
                onChange={(e) => setRecipientInputValue(e.target.value)}
                placeholder='Enter recipient’s address'
                onClear={() => {
                  setRecipientInputValue('')
                  setReceiverAddress(null)
                }}
                divClassName={cn(
                  'rounded-2xl w-full flex items-center gap-[10px] bg-gray-50 dark:bg-gray-900 py-3 pr-3 pl-4   border border-transparent hover:border-secondary-400 focus-within:border-monochrome dark:focus-within:border-monochrome',
                  {
                    '!border-red-300': !!addressError,
                  },
                )}
                inputClassName='flex flex-grow text-base text-gray-400 outline-none bg-white-0 font-bold dark:text-white-100 text-md placeholder:font-medium dark:placeholder:text-gray-400  !leading-[21px]'
              />
            </div>

            {addressError ? (
              <Text
                size='sm'
                color='text-red-300'
                className='font-medium mt-1'
                data-testing-id='send-recipient-address-error-ele'
              >
                {addressError}
              </Text>
            ) : null}

            {recipientInputValue.length > 0 ? null : (
              <>
                {Object.values(contacts).length === 0 &&
                walletsList.length === 0 ? null : walletsList.length === 0 ? (
                  <Text className='font-bold mt-2' color='text-muted-foreground' size='xs'>
                    Contacts
                  </Text>
                ) : (
                  <div className='flex gap-2.5 mt-2'>
                    <div
                      className={cn(
                        'font-medium text-xs border bg-secondary py-2 px-4 hover:border-secondary-400 cursor-pointer',
                        {
                          'text-monochrome !border-monochrome rounded-full':
                            selectedTab === 'contacts',
                          'text-muted-foreground border-transparent rounded-full':
                            selectedTab !== 'contacts',
                        },
                      )}
                      onClick={() => setSelectedTab('contacts')}
                    >
                      Your contacts
                    </div>
                    <div
                      className={cn(
                        'font-medium text-xs border bg-secondary py-2 px-4 hover:border-secondary-400 cursor-pointer',
                        {
                          'text-monochrome !border-monochrome rounded-full':
                            selectedTab === 'wallets',
                          'text-muted-foreground border-transparent rounded-full':
                            selectedTab !== 'wallets',
                        },
                      )}
                      onClick={() => setSelectedTab('wallets')}
                    >
                      Your wallets
                    </div>
                  </div>
                )}

                {selectedTab === 'wallets' ? (
                  <MyWallets setSelectedAddress={handleWalletSelect} />
                ) : (
                  <MyContacts handleContactSelect={handleContactSelect} editContact={editContact} />
                )}
              </>
            )}

            {recipientInputValue.length > 0 && !addressError ? (
              <button
                className={classNames('w-full flex items-center gap-3 cursor-pointer mt-2')}
                onClick={() => {
                  setReceiverAddress({
                    address: recipientInputValue,
                    avatarIcon: Images.Misc.getWalletIconAtIndex(0),
                    chainIcon: '',
                    chainName: activeChain,
                    emoji: undefined,
                    name: existingResult?.name ?? '',
                    selectionType: 'notSaved',
                  })
                  allowReview()
                }}
              >
                <div className='flex justify-between items-center w-full'>
                  <div className='flex items-center gap-4'>
                    <img className='h-11 w-11' src={Images.Misc.getWalletIconAtIndex(0)} />
                    <div className='flex flex-col'>
                      {existingResult && (
                        <p className='font-bold text-left text-monochrome text-sm capitalize'>
                          {existingResult.name}
                        </p>
                      )}
                      {existingResult ? (
                        <p className='text-sm text-muted-foreground text-left'>
                          {sliceAddress(recipientInputValue)}
                        </p>
                      ) : (
                        <p className='font-bold text-left text-monochrome text-sm'>
                          {sliceAddress(recipientInputValue)}
                        </p>
                      )}
                    </div>
                  </div>
                  <CaretRight className='text-muted-foreground' size={16} />
                </div>
              </button>
            ) : null}
          </div>
        </BottomModal>
      </>
    )
  },
)
