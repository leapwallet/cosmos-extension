import { ArrowSquareOut, Dot } from '@phosphor-icons/react'
import Text from 'components/text'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { BannerAD } from './DiscoverBannerAD'

const BannerAdCard = observer(
  ({ bannerData }: { bannerData: BannerAD; index: number; isActive: boolean }) => {
    const handleUrlClick = () => {
      window.open(bannerData.url, '_blank')
    }
    return (
      <div className={`px-4 relative inline-block overflow-hidden snap-center`}>
        <div className='flex flex-col rounded-xl bg-secondary-100 w-full p-3 gap-2.5'>
          <div className='flex items-center gap-2'>
            <img src={bannerData.icon ?? Images.Logos.GenericDark} className='w-9 h-9' />
            <div className='flex flex-col grow'>
              <Text size='md' color='text-monochrome' className='font-bold'>
                {bannerData.title}
              </Text>
              <div className='flex items-center'>
                <Text size='xs' color='text-muted-foreground' className='font-bold'>
                  {bannerData.category}
                </Text>
                <Dot size={16} className='text-muted-foreground' />
                <Text size='xs' color='text-muted-foreground' className='font-bold'>
                  Featured
                </Text>
              </div>
            </div>
            <div
              className='py-1 px-3 rounded-full bg-accent-blue-200 hover:bg-accent-blue flex items-center gap-1 cursor-pointer'
              onClick={handleUrlClick}
            >
              <Text size='sm' color='text-monochrome' className='font-bold'>
                Visit
              </Text>
              <ArrowSquareOut size={12} />
            </div>
          </div>
          <Text size='xs' color='text-muted-foreground' className='font-medium text-wrap'>
            {bannerData.subtitle}
          </Text>
        </div>
      </div>
    )
  },
)

export default BannerAdCard
