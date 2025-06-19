import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import { X } from '@phosphor-icons/react'
import { observer } from 'mobx-react-lite'
import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from 'utils/cn'

import { BannerADData, getMixpanelBannerId } from './utils'

export const BannerAdCard = observer(
  ({
    bannerData,
    chain,
    index,
    onClick,
    onClose,
    activeIndex,
  }: {
    bannerData: BannerADData
    chain: ChainInfo
    index: number
    // eslint-disable-next-line no-unused-vars
    onClick: (bannerId: string, index: number) => void
    // eslint-disable-next-line no-unused-vars
    onClose: (bannerId: string, index: number) => void
    activeIndex: number
  }) => {
    const navigate = useNavigate()

    const handleClick = useCallback(() => {
      if (bannerData.banner_type === 'redirect-interanlly') {
        const bannerId = getMixpanelBannerId(bannerData?.id, bannerData.attributes?.campaign_id)
        navigate(`${bannerData.redirect_url}&bannerId=${bannerId}`)
      } else {
        if (bannerData?.redirect_url && bannerData?.redirect_url !== '#') {
          window.open(bannerData.redirect_url)
        }
      }

      onClick(bannerData.id, index)

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bannerData, index, onClick])

    return (
      <div
        key={bannerData.id}
        className={
          'relative shrink-0 inline-block overflow-hidden w-full snap-center h-16 aspect-[11/2]'
        }
      >
        <button
          className={cn(
            'overflow-hidden w-full rounded-lg items-center flex h-full transform transition-transform ease-out duration-300 object-cover',
            activeIndex === index ? 'scale-100' : 'scale-[87.5%]',
            activeIndex < index ? 'origin-left' : 'origin-right',
          )}
          onClick={handleClick}
        >
          {bannerData?.image_url ? (
            <img
              src={bannerData.image_url}
              alt='chain logo'
              className='z-0 right-0 h-[64px] w-full'
            />
          ) : (
            <div className='p-4 flex items-center'>
              <img
                src={bannerData?.logo ?? chain?.chainSymbolImageUrl}
                alt='chain logo'
                width='24'
                height='24'
                className='object-contain rounded-full h-10 w-10 mr-2 m-w-10'
                style={{
                  border: `8px solid ${chain?.theme.primaryColor}`,
                }}
              />
              <span className='text-muted-foreground text-xs'>{bannerData.title}</span>
            </div>
          )}
        </button>

        <button
          className='absolute top-1 right-1 rounded-full size-4 flex cursor-pointer'
          onClick={(event) => {
            event.stopPropagation()
            onClose(bannerData.id, index)
          }}
        >
          <X size={12} className='text-foreground m-auto' />
        </button>
      </div>
    )
  },
)
