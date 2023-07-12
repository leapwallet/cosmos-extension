import { TokensListByCollection } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import { selectedChainAlertState } from 'atoms/selected-chain-alert'
import AlertStrip from 'components/alert-strip/AlertStrip'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import PopupLayout from 'components/layout/popup-layout'
import NFTGallerySkeleton from 'components/Skeletons/NFTGallerySkeleton'
import Text from 'components/text'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { ChainLogos } from 'images/logos'
import SelectChain from 'pages/home/SelectChain'
import SideNav from 'pages/home/side-nav'
import React, { useState } from 'react'
import { useRecoilState } from 'recoil'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'

import { ManageCollections, NoNFTEmptyCard } from '../components'
import NFTCollection from './collection'
import { NFTDetailedInformation } from './types'

type SeiNFTGalleryProps = {
  setNFTDetailsProp: React.Dispatch<React.SetStateAction<NFTDetailedInformation | undefined>>
  isLoading: boolean
  totalNFTs: number | undefined
  error: unknown
  nfts: TokensListByCollection[]
  forceChain?: SupportedChain
  data: TokensListByCollection[]
}

const SeiNFTGallery: React.FC<SeiNFTGalleryProps> = ({
  setNFTDetailsProp,
  isLoading,
  totalNFTs,
  error,
  nfts,
  forceChain,
  data,
}) => {
  const [showSideNav, setShowSideNav] = useState(false)
  const activeChain = useActiveChain()

  const [showManageCollections, setShowManageCollections] = useState(false)
  const [showChainSelector, setShowChainSelector] = useState(false)
  const [showSelectedChainAlert, setShowSelectedChainAlert] =
    useRecoilState(selectedChainAlertState)

  const defaultTokenLogo = useDefaultTokenLogo()
  const isTestnet = useSelectedNetwork() === 'testnet'
  const [nftsImage, setNFTsImage] = useState<{ [key: string]: string }>({})

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
            imgSrc={ChainLogos[activeChain] ?? defaultTokenLogo}
            onImgClick={
              isCompassWallet()
                ? undefined
                : function noRefCheck() {
                    setShowChainSelector(true)
                  }
            }
            title='NFTs'
            topColor={Colors.getChainColor(activeChain)}
          />
        }
      >
        {showSelectedChainAlert && !isCompassWallet() && (
          <AlertStrip
            message={`You are on ${ChainInfos[activeChain].chainName}${
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

          {isLoading ? (
            <div className='mt-8'>
              <NFTGallerySkeleton />
            </div>
          ) : (
            <>
              {!error && nfts?.length > 0 ? (
                <>
                  {totalNFTs !== undefined && (
                    <div className='text-sm text-gray-600 mb-6'>
                      {totalNFTs} NFT{totalNFTs === 1 ? '' : 's'}
                    </div>
                  )}
                </>
              ) : (
                <div className='text-sm text-gray-600 mb-6'>No NFTs</div>
              )}

              {!error && nfts?.length > 0 ? (
                <div className='mb-4'>
                  {nfts.map((nft) => (
                    <NFTCollection
                      key={nft.collection.address}
                      tokensListByCollection={nft}
                      setNFTDetailsProp={setNFTDetailsProp}
                      forceChain={forceChain}
                      setNFTsImage={setNFTsImage}
                    />
                  ))}
                </div>
              ) : (
                <NoNFTEmptyCard title='No NFTs collected' subTitle='Your assets will appear here' />
              )}
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
        nfts={data}
        nftsImage={nftsImage}
      />
    </div>
  )
}

export default SeiNFTGallery
