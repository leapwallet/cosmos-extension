import { Buttons, CardDivider, Header, HeaderActionType } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import PopupLayout from 'components/layout/popup-layout'
import NFTImageCard from 'components/nft-image-card'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import React from 'react'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'

import { NFTDetailedInformation } from './types'
import { normalizeImageSrc } from './util'

type NFTDetailsProps = {
  info: NFTDetailedInformation
  setNFTDetailsProp: React.Dispatch<React.SetStateAction<NFTDetailedInformation | undefined>>
}

const NFTDetails: React.FC<NFTDetailsProps> = ({ info, setNFTDetailsProp }) => {
  const activeChain = useActiveChain()

  return (
    <>
      <PopupLayout
        header={
          <Header
            action={{
              onClick: function noRefCheck() {
                setNFTDetailsProp(undefined)
              },
              type: HeaderActionType.CANCEL,
            }}
            size='sm'
            title='NFT Details'
            topColor={Colors.getChainColor(activeChain)}
          />
        }
      >
        <div className='w-full flex flex-col p-[28px] mb-16'>
          <div className='rounded-2xl mb-7'>
            <NFTImageCard
              imgSrc={normalizeImageSrc(info.imgSrc)}
              textNft={{ name: info.name, description: info.description }}
            />
          </div>

          <div className='flex justify-center text-2xl font-black text-gray-900 dark:text-white-100'>
            {info.name}
          </div>

          <div
            className={classNames('mb-4 flex justify-center', {
              'text-[#E18881]': !isCompassWallet(),
              'text-[#224874]': isCompassWallet(),
            })}
          >
            {info.collection}{' '}
            <img
              className='ml-1'
              src={
                isCompassWallet()
                  ? Images.Misc.CompassNftVerifiedCollection
                  : Images.Misc.NFTVerifiedCollection
              }
            ></img>
          </div>

          {!!info.tokenUri && (
            <Buttons.Generic
              disabled={false}
              className='w-[344px] mb-6'
              color={Colors.getChainColor(activeChain)}
              onClick={() => window.open(info.tokenUri, '_blank')}
            >
              View Details
            </Buttons.Generic>
          )}

          <CardDivider />

          <div className='w-100 font-bold text-left text-gray-400 text-sm mb-1 mt-6'>
            Description
          </div>
          <div className=' font-medium text-left text-base text-gray-900 dark:text-white-100 mb-6'>
            {info.description}
          </div>
        </div>
      </PopupLayout>
    </>
  )
}

export default NFTDetails
