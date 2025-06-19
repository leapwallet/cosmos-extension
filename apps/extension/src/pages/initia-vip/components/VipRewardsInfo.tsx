import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import React from 'react'

export const VipRewardsInfo = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title='What are VIP rewards?'>
      <div className='flex flex-col gap-7'>
        <Text color='dark:text-gray-200 text-gray-800' size='sm' className='!leading-6'>
          The Vested Interest Program (VIP) is Initia’s way to reward you for participating in their
          interwoven ecosystem. You get INIT rewards from two pools:
        </Text>
        <div className='flex flex-col gap-5'>
          <p className='!leading-6 dark:text-gray-200 text-gray-800 text-sm'>
            <span className='font-bold !inline-block text-black-100 dark:text-white-100'>
              1. The Balance Pool:
            </span>{' '}
            It’s the amount of opINIT held on the rollup which determines the share of esINIT
            balance pool reward.
          </p>
          <p className='!leading-6 dark:text-gray-200 text-gray-800 text-sm'>
            <span className='font-bold !inline-block text-black-100 dark:text-white-100'>
              2. The Weight Pool:
            </span>{' '}
            If you hold INIT and Enshrined Liquidity Tokens, you can vote in the gauge system to
            send emissions to a specific rollup.
          </p>
        </div>
        <Text color='dark:text-gray-200 text-gray-800' size='sm' className='!leading-6'>
          VIP rewards you for being active in liquidity and governance. The more you participate,
          the more you earn.
        </Text>
      </div>
    </BottomModal>
  )
}
