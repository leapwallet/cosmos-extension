import {
  ENABLED_NFTS_COLLECTIONS,
  Key,
  useDisabledNFTsCollections,
  useEnabledNftsCollectionsStore,
  useSetDisabledNFTsInStorage,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  ArrowFatLineUp,
  ArrowLeft,
  ArrowsOutSimple,
  ArrowSquareOut,
  Eye,
  EyeSlash,
  Heart,
  Smiley,
  X,
} from '@phosphor-icons/react'
import classNames from 'classnames'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { favNftStore } from 'stores/manage-nft-store'
import { AddressBook } from 'utils/addressbook'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import { normalizeImageSrc } from 'utils/normalizeImageSrc'
import { sliceWord } from 'utils/strings'
import Browser from 'webextension-polyfill'

import SaveAddressSheet from './components/recipient-card/save-address-sheet'
import { useNftContext } from './context'
import { SelectNFTRecipient } from './SelectNFTRecipient'
import { useNFTSendContext } from './send-nft/context'
import { ReviewNFTTransferSheet } from './send-nft/review-transfer-sheet'

export const NftDetails = observer(() => {
  const [showSelectRecipient, setShowSelectRecipient] = useState(false)
  const [selectedContact, setSelectedContact] = useState<AddressBook.SavedAddress | undefined>()
  const [isAddContactSheetVisible, setIsAddContactSheetVisible] = useState(false)
  const [showReviewSheet, setShowReviewSheet] = useState(false)
  const { activeWallet, setActiveWallet } = useActiveWallet()
  const [toast, setToast] = useState('')
  const [showImage, setShowImage] = useState(false)
  const { nftDetails, setNftDetails } = useNftContext()
  const { setReceiverAddress } = useNFTSendContext()
  const activeChain = useActiveChain()
  const containerRef = useRef<HTMLDivElement | null>(null)

  const { enabledNftsCollections, setEnabledNftsCollections } = useEnabledNftsCollectionsStore()
  const disabledNFTsCollections = useDisabledNFTsCollections()
  const setDisabledNFTsCollections = useSetDisabledNFTsInStorage()

  const nftIndex = useMemo(() => {
    return `${nftDetails?.collection.address ?? ''}-:-${
      nftDetails?.tokenId ?? nftDetails?.domain ?? ''
    }`
  }, [nftDetails?.collection.address, nftDetails?.domain, nftDetails?.tokenId])

  const isInFavNfts = favNftStore.favNfts.includes(nftIndex)

  const isInProfile = useMemo(() => {
    return activeWallet?.avatarIndex === nftIndex
  }, [activeWallet?.avatarIndex, nftIndex])

  const isInHiddenNfts = disabledNFTsCollections.includes(nftDetails?.collection.address ?? '')

  const showProfileOption = useMemo(() => {
    return (
      !!nftDetails?.image &&
      !nftDetails.image.includes('mp4') &&
      !nftDetails.media_type?.includes('mp4')
    )
  }, [nftDetails?.image, nftDetails?.media_type])

  const handleFavNftClick = async () => {
    if (!activeWallet) {
      return
    }

    if (isInFavNfts) {
      await favNftStore.removeFavNFT(nftIndex, activeWallet.id)
      setToast('Removed from favourites')
    } else {
      await favNftStore.addFavNFT(nftIndex, activeWallet.id)
      setToast('Added to favourites')
    }
  }

  const handleProfileClick = async () => {
    if (activeWallet && showProfileOption) {
      let newWallet: Key = {
        ...activeWallet,
        avatar: normalizeImageSrc(nftDetails?.image ?? '', nftDetails?.collection.address ?? ''),
        avatarIndex: nftIndex,
      }
      if (isInProfile) {
        newWallet = {
          ...activeWallet,
          avatar: undefined,
          avatarIndex: undefined,
        }
      }

      setActiveWallet(newWallet)
      await Wallet.storeWallets({ [newWallet.id]: newWallet })
      setToast('Profile picture updated!')
    }
  }

  const handleToggleClick = async (
    isEnabled: boolean,
    collectionAddress: string,
    chain: SupportedChain,
  ) => {
    let _disabledNFTsCollections: string[] = []
    let _enabledNftsCollections: string[] = []
    const existingEnabledNftsCollections = enabledNftsCollections?.[chain] ?? []

    if (isEnabled) {
      _disabledNFTsCollections = disabledNFTsCollections.filter(
        (collection) => collection !== collectionAddress,
      )

      if (isCompassWallet() && !existingEnabledNftsCollections.includes(collectionAddress)) {
        _enabledNftsCollections = [...existingEnabledNftsCollections, collectionAddress]
      }
      setToast('Removed from hidden')
    } else {
      if (!_disabledNFTsCollections.includes(collectionAddress)) {
        _disabledNFTsCollections = [...disabledNFTsCollections, collectionAddress]
      }

      if (isCompassWallet()) {
        _enabledNftsCollections = existingEnabledNftsCollections.filter(
          (collection) => collection !== collectionAddress,
        )
      }
      setToast('Added to hidden')
    }

    await setDisabledNFTsCollections(_disabledNFTsCollections)

    if (isCompassWallet()) {
      setEnabledNftsCollections({
        ...enabledNftsCollections,
        [chain]: _enabledNftsCollections,
      })
      await Browser.storage.local.set({
        [ENABLED_NFTS_COLLECTIONS]: JSON.stringify({
          ...enabledNftsCollections,
          [chain]: _enabledNftsCollections,
        }),
      })
    }
  }

  const editContact = (savedAddress?: AddressBook.SavedAddress) => {
    if (savedAddress) {
      setSelectedContact(savedAddress)
    }
    setIsAddContactSheetVisible(true)
    setShowSelectRecipient(false)
  }

  useEffect(() => {
    if (toast) {
      setTimeout(() => setToast(''), 3000)
    }
  }, [toast])

  useEffect(() => {
    if (containerRef && containerRef.current) {
      document.getElementById('popup-layout')?.scroll({ top: 0 })
    }
  }, [])

  if (showImage) {
    return createPortal(
      <div
        className='absolute top-0 z-10 flex items-center justify-center panel-width panel-height rounded-lg overflow-hidden bg-secondary'
        onClick={() => setShowImage(false)}
      >
        <X
          size={28}
          onClick={() => setShowImage(false)}
          className='absolute top-3 right-3 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white cursor-pointer transition'
        />
        <img
          src={nftDetails?.image ?? Images.Logos.GenericNFT}
          onClick={(e) => {
            e.stopPropagation()
          }}
          onError={imgOnError(Images.Logos.GenericNFT)}
          className='w-[352px] h-[352px] overflow-hidden object-contain'
        />
      </div>,
      document.getElementById('popup-layout')?.parentNode as HTMLElement,
    )
  }

  return (
    <div ref={containerRef} className='relative overflow-scroll mb-20'>
      <div className='flex justify-between items-center px-5 py-[14px]'>
        <ArrowLeft
          size={24}
          className='text-muted-foreground hover:text-monochrome cursor-pointer'
          onClick={() => setNftDetails(null)}
        />
        <div className='flex gap-x-0.5'>
          <Text className='text-[18px] font-bold' color='text-monochrome'>
            {sliceWord(nftDetails?.collection.name ?? '', 15, 0)}
          </Text>
          <Text className='text-[18px] font-bold' color='text-muted-foreground'>
            #{sliceWord(nftDetails?.tokenId ?? '', 5, 0)}
          </Text>
        </div>
        <div></div>
      </div>
      <div className='flex flex-col px-6 py-4 gap-y-8'>
        <div className='relative'>
          <img
            src={nftDetails?.image ?? Images.Logos.GenericNFT}
            onError={imgOnError(Images.Logos.GenericNFT)}
            className='rounded-2xl w-[352px] h-[352px] overflow-hidden object-contain'
          />
          <ArrowsOutSimple
            size={32}
            onClick={() => setShowImage(true)}
            className='rounded-lg bg-secondary text-monochrome p-2 absolute bottom-[14px] right-[14px] cursor-pointer'
          />
        </div>
        <div className='flex flex-col gap-y-7'>
          <div className='px-2.5 flex gap-x-7'>
            <div className='flex flex-col gap-y-2.5 items-center'>
              <Heart
                size={62}
                weight='fill'
                className={classNames(
                  'p-5 rounded-full bg-secondary-200 hover:bg-secondary-400 cursor-pointer',
                  {
                    'text-monochrome': !isInFavNfts,
                    'text-[#D0414F]': isInFavNfts,
                  },
                )}
                onClick={handleFavNftClick}
              />
              <Text size='sm' className='font-medium text-monochrome'>
                Favorite
              </Text>
            </div>
            <div className='flex flex-col gap-y-2.5 items-center'>
              <ArrowFatLineUp
                size={62}
                weight='fill'
                className='text-monochrome p-5 rounded-full bg-secondary-200 hover:bg-secondary-400 cursor-pointer'
                onClick={() => setShowSelectRecipient(true)}
              />
              <Text size='sm' className='font-medium text-monochrome'>
                Send
              </Text>
            </div>
            <div className='flex flex-col gap-y-2.5 items-center'>
              <Smiley
                size={62}
                className={classNames(
                  'p-5 rounded-full bg-secondary-200 hover:bg-secondary-400 cursor-pointer',
                  {
                    'text-monochrome': !isInProfile,
                    'text-[#D0414F]': isInProfile,
                  },
                )}
                onClick={handleProfileClick}
              />
              <Text size='sm' className='font-medium text-monochrome'>
                Avatar
              </Text>
            </div>
            <div className='flex flex-col gap-y-2.5 items-center'>
              {isInHiddenNfts ? (
                <Eye
                  size={62}
                  weight='fill'
                  className='text-monochrome p-5 rounded-full bg-secondary-200 hover:bg-secondary-400 cursor-pointer'
                  onClick={() => {
                    if (nftDetails) {
                      handleToggleClick(true, nftDetails.collection.address, nftDetails.chain)
                    }
                  }}
                />
              ) : (
                <EyeSlash
                  size={62}
                  weight='fill'
                  className='text-monochrome p-5 rounded-full bg-secondary-200 hover:bg-secondary-400 cursor-pointer'
                  onClick={() => {
                    if (nftDetails) {
                      handleToggleClick(false, nftDetails.collection.address, nftDetails.chain)
                    }
                  }}
                />
              )}
              <Text size='sm' className='font-medium text-monochrome'>
                {isInHiddenNfts ? 'Unhide' : 'Hide'}
              </Text>
            </div>
          </div>
          <Button
            className='w-full'
            onClick={() =>
              window.open(
                normalizeImageSrc(
                  nftDetails?.tokenUri ?? '',
                  nftDetails?.collection?.address ?? '',
                ),
                '_blank',
              )
            }
            disabled={!nftDetails?.tokenUri}
          >
            <div className='flex items-center gap-x-1.5'>
              <ArrowSquareOut size={20} className='text-monochrome' />
              <Text size='md' className='font-bold text-monochrome'>
                View on marketplaca
              </Text>
            </div>
          </Button>
        </div>
        {nftDetails?.description || (nftDetails?.attributes && nftDetails.attributes.length > 0) ? (
          <div className='mt-2 flex flex-col gap-y-6'>
            {nftDetails?.description && (
              <div className='flex flex-col gap-y-3'>
                <Text size='sm' className='font-medium' color='text-muted-foreground'>
                  Description
                </Text>
                <Text
                  size='sm'
                  color='text-monochrome'
                  className='break-words'
                  style={{ wordBreak: 'break-word' }}
                >
                  {nftDetails?.description}
                </Text>
              </div>
            )}
            {nftDetails?.attributes && nftDetails.attributes.length > 0 ? (
              <>
                <div className='h-[1px] w-full bg-secondary-300' />
                <div className='flex flex-col gap-y-3'>
                  <Text size='sm' className='font-medium' color='text-muted-foreground'>
                    Features
                  </Text>
                  <div className='flex flex-wrap gap-3 break-words'>
                    {nftDetails?.attributes?.map((attribute) => (
                      <div
                        key={attribute.trait_type}
                        className='p-2.5 rounded-lg flex flex-col gap-y-2.5 max-w-fit border-secondary-300 border'
                      >
                        <Text size='sm' color='text-muted-foreground'>
                          {attribute.trait_type}
                        </Text>
                        <Text size='sm' className='font-bold' color='text-monochrome'>
                          {attribute.value}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
        {toast && (
          <div className='sticky bottom-5 bg-primary hover:bg-primary-hover rounded-xl py-2.5 pr-[14px] pl-5 w-[352px] max-w-[352px] flex items-center justify-between'>
            <Text size='sm' className='font-medium'>
              {toast}
            </Text>
            <X size={16} onClick={() => setToast('')} className='cursor-pointer' />
          </div>
        )}
      </div>
      {showSelectRecipient && nftDetails && (
        <SelectNFTRecipient
          isOpen={showSelectRecipient}
          onClose={() => setShowSelectRecipient(false)}
          setShowReviewSheet={setShowReviewSheet}
          nftDetails={nftDetails}
          editContact={editContact}
        />
      )}
      {showReviewSheet && nftDetails && (
        <ReviewNFTTransferSheet
          isOpen={showReviewSheet}
          nftDetails={nftDetails}
          onClose={() => setShowReviewSheet(false)}
        />
      )}
      <SaveAddressSheet
        isOpen={isAddContactSheetVisible}
        onSave={(s) => {
          setReceiverAddress(s)
          setShowReviewSheet(true)
        }}
        onClose={() => {
          setIsAddContactSheetVisible(false)
          setSelectedContact(undefined)
        }}
        address={selectedContact?.address ?? ''}
        ethAddress={selectedContact?.ethAddress ?? ''}
        sendActiveChain={activeChain}
        title={selectedContact ? 'Edit Contact' : 'Add Contact'}
        showDeleteBtn={!!selectedContact}
      />
    </div>
  )
})
