import { useDisabledNFTsCollections } from '@leapwallet/cosmos-wallet-hooks'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import { selectedChainAlertState } from 'atoms/selected-chain-alert'
import AlertStrip from 'components/alert-strip/AlertStrip'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import PopupLayout from 'components/layout/popup-layout'
import NFTGallerySkeleton from 'components/Skeletons/NFTGallerySkeleton'
import Text from 'components/text'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useFavNFTs } from 'hooks/settings/useFavouriteNFTs'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { getChainImage } from 'images/logos'
import SelectChain from 'pages/home/SelectChain'
import SideNav from 'pages/home/side-nav'
import React, { Dispatch, SetStateAction, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useRecoilState } from 'recoil'
import { Colors } from 'theme/colors'

import NFTCollection from './collection'
import { ManageCollections, NoNFTEmptyCard } from './components'
import FavouriteNFTs from './favourites'
import { CollectionObjectProps } from './index'
import { useGetNFTGallerydata } from './queries'

export default function NFTGallery({
  setNFTDetailsProp,
}: {
  setNFTDetailsProp: Dispatch<SetStateAction<object | undefined>>
}) {
  const chainInfos = useChainInfos()
  const [showSideNav, setShowSideNav] = useState(false)
  const activeChain = useActiveChain()
  const [showChainSelector, setShowChainSelector] = useState(false)
  const [showSelectedChainAlert, setShowSelectedChainAlert] =
    useRecoilState(selectedChainAlertState)

  const [showManageCollections, setShowManageCollections] = useState(false)
  const isTestnet = useSelectedNetwork() === 'testnet'
  const { activeWallet } = useActiveWallet()
  const selectedNetwork = useSelectedNetwork()

  const defaultTokenLogo = useDefaultTokenLogo()
  const favList = useFavNFTs()
  const testnetUrl = `https://nft-api.elgafar-1.stargaze-apis.com/api/v1beta/profile/${activeWallet?.addresses[activeChain]}/nfts`
  const mainnetUrl = `https://nft-api.stargaze-apis.com/api/v1beta/profile/${activeWallet?.addresses[activeChain]}/nfts`
  const metadataUri = selectedNetwork === 'mainnet' ? mainnetUrl : testnetUrl

  const { data: _data, status } = useGetNFTGallerydata({ metadataUri, favList })
  const disabledNFTsCollections = useDisabledNFTsCollections()

  const data = useMemo(() => {
    if (_data) {
      const { nftData, collectionData, favData } = _data

      const _nftData = nftData.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (nft: any) => !disabledNFTsCollections.includes(nft.collection.contractAddress),
      )

      const _favData = favData.filter(
        (nft) => !disabledNFTsCollections.includes(nft.collection.contractAddress),
      )

      return { nftData: _nftData, collectionData, favData: _favData }
    }

    return {}
  }, [_data, disabledNFTsCollections])

  const { nftsImage, formattedNFTsCollectionInfo } = useMemo(() => {
    if (data?.collectionData) {
      const _nftsImage: { [key: string]: string } = {}

      const _formattedInfo = data.collectionData.map((collection) => {
        _nftsImage[collection.contractAddr] = collection.items[0].image

        return {
          tokens: [],
          collection: { name: collection.name, address: collection.contractAddr },
        }
      })

      return { nftsImage: _nftsImage, formattedNFTsCollectionInfo: _formattedInfo }
    }

    return { nftsImage: {}, formattedNFTsCollectionInfo: [] }
  }, [data?.collectionData])

  return (
    <div className='relative w-[400px] overflow-clip'>
      <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
      <PopupLayout
        header={
          <Header
            action={{
              onClick: function noRefCheck() {
                setShowSideNav(true)
              },
              type: HeaderActionType.NAVIGATION,
            }}
            imgSrc={getChainImage(activeChain) ?? defaultTokenLogo}
            onImgClick={function noRefCheck() {
              setShowChainSelector(true)
            }}
            title='NFTs'
            topColor={Colors.getChainColor(activeChain)}
          />
        }
      >
        {showSelectedChainAlert && (
          <AlertStrip
            message={`You are on ${chainInfos[activeChain].chainName}${
              isTestnet ? ' Testnet' : ''
            }`}
            bgColor={Colors.getChainColor(activeChain)}
            alwaysShow={isTestnet}
            onHide={() => {
              setShowSelectedChainAlert(false)
            }}
          />
        )}

        <div className='w-full flex flex-col p-[28px] mb-16'>
          <div className='text-[28px] text-black-100 dark:text-white-100 font-bold'>
            Your collection
          </div>

          {status === 'success' && data?.nftData ? (
            <div className='text-sm text-gray-600 mb-6'>
              {data.nftData && data.nftData.length} NFTs
            </div>
          ) : (
            <Skeleton count={1} className='mb-6' />
          )}

          {status === 'success' ? (
            data?.nftData.length !== 0 ? (
              <>
                <div>
                  {data?.favData && (
                    <FavouriteNFTs favData={data.favData} setNFTDetailsProp={setNFTDetailsProp} />
                  )}
                </div>
                <div className='mb-4'>
                  {data?.collectionData &&
                    data.collectionData
                      .filter(
                        (collection) => !disabledNFTsCollections.includes(collection.contractAddr),
                      )
                      .map((collection: CollectionObjectProps, index: number) => (
                        <div key={index}>
                          <NFTCollection
                            collectionData={collection}
                            setNFTDetailsProp={setNFTDetailsProp}
                          />
                        </div>
                      ))}
                </div>
              </>
            ) : (
              <NoNFTEmptyCard title='No NFTs collected' subTitle='Your assets will appear here' />
            )
          ) : (
            <>
              <NFTGallerySkeleton />
            </>
          )}

          <div onClick={() => setShowManageCollections(true)}>
            <Text
              size='md'
              className='font-bold justify-center items-center cursor-pointer'
              style={{ color: Colors.getChainColor(activeChain) }}
            >
              Manage Collections
            </Text>
          </div>
        </div>
      </PopupLayout>

      <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
      <BottomNav label={BottomNavLabel.NFTs} />
      <ManageCollections
        isVisible={showManageCollections}
        onClose={() => setShowManageCollections(false)}
        nfts={formattedNFTsCollectionInfo}
        nftsImage={nftsImage}
      />
    </div>
  )
}
