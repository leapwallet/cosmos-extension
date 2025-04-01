import { Button } from 'components/ui/button'
import { EyeIcon } from 'icons/eye-icon'
import React from 'react'

type WatchWalletPopupProps = {
  handleCancel: () => void
}

export default function WatchWalletPopup({ handleCancel }: WatchWalletPopupProps) {
  return (
    <>
      <div className='flex flex-col gap-4 items-center rounded-xl bg-secondary-100 px-4 py-12 border border-border-bottom my-auto'>
        <div className='relative bg-accent-blue-200 rounded-full p-4 flex items-center justify-center'>
          <EyeIcon className='size-8' />
        </div>
        <div className='flex flex-col gap-2 items-center'>
          <span className='text-lg font-medium'>You are watching this wallet.</span>
          <span className='text-sm text-muted-foreground text-center font-medium'>
            Import the wallet using your recovery phrase to manage assets and sign transactions.
          </span>
        </div>
      </div>

      <Button variant={'secondary'} className='w-full mt-auto' onClick={handleCancel}>
        Cancel
      </Button>
    </>
  )
}
