import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import React from 'react'

export const LastUpdatedScoreInfo = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title='Last updated score'>
      <Text color='dark:text-gray-200 text-gray-800' size='sm' className='!leading-6'>
        The Last Updated Score shows your most recent VIP Score. It measures how active and engaged
        you are in the Initia ecosystem up to the last epoch. Your score is key to figuring out how
        much of the earned esINIT you can unlock.
      </Text>
    </BottomModal>
  )
}
