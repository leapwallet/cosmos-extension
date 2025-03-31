import { CheckCircle } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import React from 'react'

import { FundBannerData } from './FundBanners'

interface FundsSheetProps {
  isVisible: boolean
  onClose: () => void
  bannerData: FundBannerData[]
  showCopyAddress: boolean
  modalTitle: string
}

const FundsSheet = ({
  isVisible,
  onClose,
  bannerData,
  showCopyAddress,
  modalTitle,
}: FundsSheetProps) => {
  return (
    <BottomModal isOpen={isVisible} onClose={onClose} title={modalTitle}>
      <div className='flex flex-col gap-3'>
        {bannerData.map((d: FundBannerData, index: number) => (
          <div
            key={index}
            onClick={d.onClick}
            className='flex relative overflow-hidden gap-3 items-center cursor-pointer p-3 rounded-lg dark:bg-gray-950 bg-white-100'
          >
            <div className='flex items-center justify-center bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-850 w-10 h-10 rounded-3xl'>
              <d.icon size={24} style={{ color: d.textColor }} />
            </div>
            <div>
              <Text size='sm' className='font-medium mb-[2px]'>
                {d.title}
              </Text>
              <Text size='xs' color='text-gray-400' className='font-medium'>
                {d.content}
              </Text>
            </div>

            {showCopyAddress && d.title === 'Receive / Deposit' && (
              <div className='flex absolute w-full h-full bg-green-600 top-0 left-0 px-4 items-center'>
                <CheckCircle weight='fill' size={30} className='text-white-100 mr-3' />
                <Text size='sm' className='font-bold dark:text-white-100 text-white-100'>
                  Copied Address
                </Text>
              </div>
            )}
          </div>
        ))}
      </div>
    </BottomModal>
  )
}

export default FundsSheet
