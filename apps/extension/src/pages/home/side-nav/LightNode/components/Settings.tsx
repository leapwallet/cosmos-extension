import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
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
      <div className='bg-secondary-100 flex items-center justify-between p-4 rounded-2xl mb-2'>
        <span className='font-bold text-md'>Reset sync progress</span>

        <Button size={'sm'} variant={'secondary'} onClick={handleClearStorage}>
          Clear storage
        </Button>
      </div>

      <span className='ml-2 text-sm text-muted-foreground'>
        Clear sync information saved on this device
      </span>
    </BottomModal>
  )
}

export default Settings
