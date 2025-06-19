import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import React from 'react'

export const VipGaugeInfo = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title='VIP Gauge'>
      <div className='flex flex-col gap-7'>
        <Text color='dark:text-gray-200 text-gray-800' size='sm' className='!leading-6'>
          A VIP Gauge helps decide how rewards from the Weight Pool are distributed among different
          Layer 2 chains (rollups) in the Initia ecosystem.
        </Text>
        <p className='!leading-6 dark:text-gray-200 text-gray-800 text-sm'>
          Each{' '}
          <span className='font-bold text-black-100 dark:text-white-100'>whitelisted rollup</span>{' '}
          has its own gauge, and the more votes it gets, the bigger the share of rewards it
          receives.
        </p>
        <Text className='font-bold' size='md' color='text-black-100 dark:text-white-100'>
          How Does It Work?
        </Text>
        <Text color='dark:text-gray-200 text-gray-800' size='sm' className='!leading-6'>
          You can use your voting power to vote for rollups. You can choose one or split your votes
          across multiple rollups.
        </Text>
        <Text color='dark:text-gray-200 text-gray-800' size='sm' className='!leading-6'>
          The more votes a rollup gets, the larger the share of rewards it and its users (including
          you) will receive.
        </Text>
        <p className='!leading-6 dark:text-gray-200 text-gray-800 text-sm'>
          This system ensures that{' '}
          <span className='font-bold text-black-100 dark:text-white-100'>your votes</span> help
          shape the Initia ecosystem while maximizing your rewards.
        </p>
      </div>
    </BottomModal>
  )
}
