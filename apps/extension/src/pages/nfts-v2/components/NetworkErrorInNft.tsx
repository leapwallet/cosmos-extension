import { NftStore } from '@leapwallet/cosmos-wallet-store'
import { Buttons } from '@leapwallet/leap-ui'
import { ArrowCounterClockwise } from '@phosphor-icons/react'
import classNames from 'classnames'
import Text from 'components/text'
import { Images } from 'images'
import React from 'react'

import { CantSeeNfts } from './index'

type NetworkErrorInNftProps = {
  title: string
  subTitle: string | React.ReactNode
  showRetryButton?: boolean
  className?: string
  nftStore: NftStore
  setShowAddCollectionSheet: (value: React.SetStateAction<boolean>) => void
}

export default function NetworkErrorInNft({
  title,
  subTitle,
  showRetryButton = false,
  className = '',
  nftStore,
  setShowAddCollectionSheet,
}: NetworkErrorInNftProps) {
  const onRetry = () => {
    nftStore.loadNfts()
  }

  return (
    <div className='px-6 pt-4 pb-8'>
      <div
        className={classNames(
          'bg-white-100 dark:bg-gray-950 rounded-xl pt-8 p-4 flex flex-col items-center',
          className,
        )}
      >
        <img src={Images.Misc.FrogSad} alt='FrogSad' className='mb-6' />

        <Text size='sm' className='font-bold mb-1'>
          {title}
        </Text>
        <Text
          size='xs'
          color='text-gray-800 dark:text-gray-200'
          className='font-medium text-center !leading-5'
        >
          {subTitle}
        </Text>

        {showRetryButton && (
          <Buttons.Generic
            size='normal'
            className='w-full mt-6 !bg-black-100 dark:!bg-white-100 text-white-100 dark:text-black-100'
            title={'Retry'}
            onClick={onRetry}
          >
            <div className='flex items-center gap-2'>
              Retry
              <ArrowCounterClockwise
                size={20}
                className='text-white-100 dark:text-black-100'
                style={{ transform: 'rotateY(180deg)' }}
              />
            </div>
          </Buttons.Generic>
        )}
      </div>

      <CantSeeNfts
        openAddCollectionSheet={() => setShowAddCollectionSheet(true)}
        className='mt-4 w-full'
        nftStore={nftStore}
      />
    </div>
  )
}
