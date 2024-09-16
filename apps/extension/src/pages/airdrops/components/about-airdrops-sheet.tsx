import { Info } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import React from 'react'

import GoToLeapboard from './GoToLeapboard'

type AboutAirdropsSheetProps = {
  isOpen: boolean
  onClose: () => void
}

export const AboutAirdropsSheet: React.FC<AboutAirdropsSheetProps> = ({ isOpen, onClose }) => {
  return (
    <BottomModal
      isOpen={isOpen}
      closeOnBackdropClick={true}
      onClose={onClose}
      title='About Airdrops'
    >
      <Text size='sm' color='text-gray-800 dark:text-gray-200' className='font-medium mb-3'>
        Only active airdrops that Leap has partnered with for eligibility tracking are displayed
        here. For information on other airdrops, visit our Leap Dashboard.
      </Text>

      <GoToLeapboard />

      <div className='flex gap-2 mt-8 mb-2 items-center'>
        <Info size={20} className='text-black-100 dark:text-white-100' />
        <Text size='md' className='font-bold'>
          Disclaimer
        </Text>
      </div>
      <Text size='sm' color='text-gray-800 dark:text-gray-200' className='font-medium'>
        We aggregate airdrops data without endorsing or verifying it. Accuracy, relevance, or
        timeliness of data not guaranteed. Conduct your own research before engaging.
      </Text>
    </BottomModal>
  )
}
