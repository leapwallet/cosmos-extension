import {
  FractionalizedNftInformation,
  Key,
  NftPage,
  useFractionalizedNftContracts,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { CardDivider, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { UploadSimple } from '@phosphor-icons/react'
import classNames from 'classnames'
import { AlertStrip } from 'components/alert-strip'
import PopupLayout from 'components/layout/popup-layout'
import { useChainPageInfo } from 'hooks'
import { useFavNFTs, useHiddenNFTs, useModifyFavNFTs, useModifyHiddenNFTs } from 'hooks/settings'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import { Colors } from 'theme/colors'
import { getChainName } from 'utils/getChainName'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
import { normalizeImageSrc } from 'utils/normalizeImageSrc'
import { sessionGetItem, sessionRemoveItem } from 'utils/sessionStorage'

import {
  Chip,
  FractionalizedNftDescription,
  NftCardCarousel,
  NftDetailsMenu,
  NonFractionalizedNftDescription,
} from './components'
import { SendNftCard } from './components/send-nft'
import { useNftContext } from './context'

export function NftDetails() {
  const chainInfos = useChainInfos()
  const fractionalizedNftContracts = useFractionalizedNftContracts()

  const { topChainColor } = useChainPageInfo()
  const navigate = useNavigate()
  const { activeWallet, setActiveWallet } = useActiveWallet()
  const [alertMsg, setAlertMsg] = useState({ body: '', status: '' })

  const [showMenu, setShowMenu] = useState(false)
  const [coverImage, setCoverImage] = useState(true)
  const { setActivePage, nftDetails, setNftDetails } = useNftContext()

  const favNfts = useFavNFTs()
  const [showSendNFT, setShowSendNFT] = useState(false)
  const hiddenNfts = useHiddenNFTs()
  const { addFavNFT, removeFavNFT } = useModifyFavNFTs()
  const { addHiddenNFT, removeHiddenNFT } = useModifyHiddenNFTs()

  const giveSendOption = useMemo(() => {
    return isCompassWallet() || nftDetails?.chain === 'mainCoreum'
  }, [nftDetails?.chain])

  const isFractionalizedNft = useMemo(() => {
    return fractionalizedNftContracts.includes(nftDetails?.collection.address ?? '')
  }, [fractionalizedNftContracts, nftDetails?.collection.address])

  const nftImages = useMemo(() => {
    if (isFractionalizedNft) {
      const _nftDetails = nftDetails as unknown as FractionalizedNftInformation
      if (_nftDetails?.Images && _nftDetails.Images.length > 0) {
        return _nftDetails.Images.map((image) =>
          normalizeImageSrc(image, nftDetails?.collection.address ?? ''),
        )
      }
    }

    return [normalizeImageSrc(nftDetails?.image ?? '', nftDetails?.collection.address ?? '')]
  }, [isFractionalizedNft, nftDetails])

  const nftIndex = useMemo(() => {
    return `${nftDetails?.collection.address ?? ''}-:-${
      nftDetails?.tokenId ?? nftDetails?.domain ?? ''
    }`
  }, [nftDetails?.collection.address, nftDetails?.domain, nftDetails?.tokenId])

  const isInFavNfts = useMemo(() => {
    return favNfts.includes(nftIndex)
  }, [favNfts, nftIndex])

  const isInProfile = useMemo(() => {
    return activeWallet?.avatarIndex === nftIndex
  }, [activeWallet?.avatarIndex, nftIndex])

  const isInHiddenNfts = useMemo(() => {
    return hiddenNfts.includes(nftIndex)
  }, [hiddenNfts, nftIndex])

  const showProfileOption = useMemo(() => {
    return (
      !!nftDetails?.image &&
      !nftDetails.image.includes('mp4') &&
      !nftDetails.media_type?.includes('mp4')
    )
  }, [nftDetails?.image, nftDetails?.media_type])

  const handleFavNftClick = async () => {
    if (isInFavNfts) {
      await removeFavNFT(nftIndex)
      setAlertMsg({ status: 'remove', body: 'Removed from favourites' })
    } else {
      await addFavNFT(nftIndex)
      setAlertMsg({ status: 'add', body: 'Added to favourites' })
    }
  }

  const handleProfileClick = async () => {
    if (activeWallet) {
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
      navigate('/home?walletAvatarChanged=true')
    }
  }

  const handleHideNftClick = async () => {
    if (isInHiddenNfts) {
      await removeHiddenNFT(nftIndex)
      setAlertMsg({ status: 'remove', body: 'Removed from hidden' })
    } else {
      await addHiddenNFT(nftIndex)
      setAlertMsg({ status: 'add', body: 'Added to hidden' })
    }
  }

  return (
    <div className='relative w-full overflow-clip panel-height'>
      <PopupLayout
        header={
          <Header
            action={{
              onClick: () => {
                if (showSendNFT) {
                  setShowSendNFT(false)
                } else {
                  const lastActivePage = sessionGetItem('nftLastActivePage') ?? 'ShowNfts'
                  setActivePage(lastActivePage as NftPage)
                  sessionRemoveItem('nftLastActivePage')
                  setNftDetails(null)
                }
              },
              type: HeaderActionType.BACK,
            }}
            title={
              <h1 className='flex'>
                <span className='truncate !max-w-[150px]' title={nftDetails?.name ?? ''}>
                  {showSendNFT ? 'Send' : nftDetails?.name ?? ''}
                </span>
              </h1>
            }
          />
        }
      >
        <div className='px-6 pt-4 pb-8 relative'>
          {alertMsg.body.length > 0 && (
            <AlertStrip
              message={alertMsg.body}
              bgColor={alertMsg.status === 'add' ? Colors.green600 : Colors.red300}
              alwaysShow={false}
              onHide={() => setAlertMsg({ body: '', status: '' })}
              className='absolute top-[10px] left-[40px] z-10 rounded-2xl w-80 h-auto p-2'
              timeOut={1000}
            />
          )}

          <NftCardCarousel
            chain={(nftDetails?.chain ?? '') as SupportedChain}
            mediaType={nftDetails?.media_type}
            textNft={{
              name: nftDetails?.domain ?? '',
              description:
                nftDetails?.extension?.description ??
                `${nftDetails?.collection?.name ?? ''} - ${nftDetails?.name}`,
            }}
            imgClassName={classNames('h-[200px] w-full', {
              'object-contain': !coverImage,
              'object-cover': coverImage,
            })}
            handleExpandClick={() => setCoverImage(!coverImage)}
            showExpand={true}
            images={nftImages}
          />

          <div className='my-4 flex items-center justify-between'>
            <div className='flex flex-col flex-1'>
              <p
                className={classNames(
                  'text-gray-800 dark:text-white-100 truncate max-w-[200px] text-lg font-bold',
                  {
                    '!max-w-[160px]': isSidePanel(),
                  },
                )}
                title={nftDetails?.name ?? ''}
              >
                {nftDetails?.name ?? ''}
              </p>
              {nftDetails?.tokenId && (
                <p
                  className={classNames('text-gray-300 text-sm truncate max-w-[180px] text-base', {
                    '!max-w-[160px]': isSidePanel(),
                  })}
                  title={nftDetails.tokenId}
                >
                  #{nftDetails.tokenId}
                </p>
              )}
            </div>

            {nftDetails?.chain && (
              <Chip className='bg-gray-100 dark:bg-gray-900 py-[3px] px-[7px] shrink-0'>
                <Chip.Image
                  className='w-[24px] h-[24px]'
                  src={chainInfos[nftDetails.chain].chainSymbolImageUrl}
                  alt={`${chainInfos[nftDetails.chain].chainName.toLowerCase()} logo`}
                />
                <Chip.Text
                  className='text-gray-800 dark:text-gray-300 text-sm max-w-[90px] truncate'
                  title={getChainName(chainInfos[nftDetails.chain].chainName)}
                >
                  {getChainName(chainInfos[nftDetails.chain].chainName)}
                </Chip.Text>
              </Chip>
            )}
          </div>

          <CardDivider />
          {!!showSendNFT && giveSendOption && nftDetails && (
            <SendNftCard
              rootDenomsStore={rootDenomsStore}
              nftDetails={nftDetails}
              rootBalanceStore={rootBalanceStore}
              forceNetwork={isCompassWallet() ? undefined : 'mainnet'}
            />
          )}
          {!showSendNFT && (
            <div className='my-4 flex justify-between items-center'>
              <button
                className={classNames(
                  'rounded-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white-100 flex items-center justify-center flex-1 py-[12px] mr-[12px]',
                  {
                    'opacity-50': !nftDetails?.tokenUri,
                    'px-[30px]': !isSidePanel(),
                    'px-[12px] flex-wrap': isSidePanel(),
                  },
                )}
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
                <div className='flex flex-row items-center'>
                  <img
                    className='mr-2 invert dark:invert-0'
                    src={Images.Misc.OpenLink}
                    alt='open'
                  />{' '}
                  View
                </div>
                <span className='ml-1'>{isFractionalizedNft ? 'details' : 'on marketplace'}</span>
              </button>

              {giveSendOption && (
                <button
                  title='send'
                  className='w-[20px] h-[20px] dark:text-gray-100 mx-1 text-black-100'
                  onClick={() => {
                    setShowSendNFT(true)
                  }}
                >
                  <UploadSimple size={16} weight='bold' className='text-current' />
                </button>
              )}

              <button
                title='favourite'
                className='w-[20px] h-[20px] mx-[12px]'
                onClick={handleFavNftClick}
              >
                {isInFavNfts ? (
                  <img src={Images.Misc.FilledFavStar} alt='star' />
                ) : (
                  <img
                    className='invert dark:invert-0'
                    src={Images.Misc.OutlinedFavStar}
                    alt='star'
                  />
                )}
              </button>

              <button title='menu' onClick={() => setShowMenu(!showMenu)}>
                <img className='invert dark:invert-0' src={Images.Misc.VerticalDots} alt='menu' />
              </button>
            </div>
          )}
          {!showSendNFT && (
            <>
              <CardDivider />
              {showMenu && (
                <NftDetailsMenu
                  handleProfileClick={handleProfileClick}
                  isInProfile={isInProfile}
                  showProfileOption={showProfileOption}
                  handleHideNftClick={handleHideNftClick}
                  isInHiddenNfts={isInHiddenNfts}
                />
              )}

              {nftDetails && (
                <>
                  {isFractionalizedNft ? (
                    <FractionalizedNftDescription nftDetails={nftDetails} color={topChainColor} />
                  ) : (
                    <NonFractionalizedNftDescription
                      nftDetails={nftDetails}
                      color={topChainColor}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </PopupLayout>
    </div>
  )
}
