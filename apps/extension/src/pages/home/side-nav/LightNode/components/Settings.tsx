import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import React from 'react'

const Settings = ({
  isVisible,
  onCloseHandler,
  handleClearStorage,
}: {
  isVisible: boolean
  onCloseHandler: () => void
  handleClearStorage: () => void
}) => {
  return (
    <BottomModal isOpen={isVisible} onClose={onCloseHandler} title={'Light Node Settings'}>
      <div className='bg-gray-50 dark:bg-gray-900 flex items-center justify-between p-4 rounded-2xl mb-2'>
        <Text size='md' className='font-bold'>
          Reset sync progress
        </Text>

        <button
          className='text-base block flex-shrink-0 px-4 py-2 font-bold text-xs text-white-100 bg-gray-950 rounded-full text-right cursor-pointer'
          onClick={handleClearStorage}
        >
          Clear storage
        </button>
      </div>
      <Text size='sm' color='text-gray-400' className='ml-2'>
        Clear sync information saved on this device
      </Text>
    </BottomModal>
  )
}

export default Settings
