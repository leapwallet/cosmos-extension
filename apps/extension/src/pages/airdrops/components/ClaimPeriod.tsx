import { CalendarBlank } from '@phosphor-icons/react'
import Text from 'components/text'
import { format } from 'date-fns'
import React from 'react'

interface ClaimPeriodProps {
  claimStartDate: Date | null
  claimEndDate: Date | null
  isClaimPeriodOver: boolean
}

export default function ClaimPeriod({
  claimStartDate,
  claimEndDate,
  isClaimPeriodOver,
}: ClaimPeriodProps) {
  return (
    <div className='flex flex-col gap-2 mb-6 bg-secondary-100 rounded-xl p-4'>
      <Text size='md' className='font-bold gap-2'>
        <CalendarBlank size={20} className='text-black-100 dark:text-white-100' />
        Claim period
      </Text>
      <div>
        {isClaimPeriodOver && (
          <Text size='sm' color='text-muted-foreground' className='font-medium'>
            Claim period of this Airdrop has passed.
          </Text>
        )}
        <Text size='sm' color='text-muted-foreground' className='font-medium'>
          {!claimStartDate
            ? 'The claim period of this airdrop hasn’t been announced yet. Stay tuned for more details.'
            : `${format(claimStartDate, 'dd MMM, yyyy')} - ${
                claimEndDate && format(claimEndDate, 'dd MMM, yyyy')
              }`}
        </Text>
      </div>
    </div>
  )
}
