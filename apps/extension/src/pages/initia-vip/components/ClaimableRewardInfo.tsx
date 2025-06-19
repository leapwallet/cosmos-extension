import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import React from 'react'

export const ClaimableRewardInfo = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title='Claimable rewards'>
      <div className='flex flex-col gap-7'>
        <Text color='dark:text-gray-200 text-gray-800' size='sm' className='!leading-6'>
          esINIT are non-transferable tokens you earn as rewards through the Initia VIP program.
          They come from the Balance Pool (based on your INIT holdings) and the Weight Pool (based
          on L1 gauge votes).
        </Text>
        <Text color='dark:text-gray-200 text-gray-800' size='sm' className='!leading-6'>
          To unlock esINIT, you need to keep a high VIP Score or use locked liquidity positions.
        </Text>
      </div>
    </BottomModal>
  )
}
