import { Warning } from '@phosphor-icons/react'
import React from 'react'
import { cn } from 'utils/cn'

export function LedgerDisconnectError({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-full flex flex-row items-start px-4 py-3 justify-start dark:bg-red-900 bg-red-100 rounded-2xl',
        className,
      )}
    >
      <Warning weight='fill' size={20} className='mr-2 text-destructive-100 p-[2px]' />
      <div>
        <p className='text-sm text-foreground font-bold !leading-[20px]'>
          Unable to connect to ledger device
        </p>
        <p className='text-xs text-secondary-800 font-medium !leading-[19px] mt-1'>
          Please check if your ledger is connected and try again.
        </p>
      </div>
    </div>
  )
}
