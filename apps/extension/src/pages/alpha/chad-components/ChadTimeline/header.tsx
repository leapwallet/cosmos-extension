import { useQueryParams } from 'hooks/useQuery'
import { ChadBadgeInactive } from 'pages/alpha/components/chad-badge'
import { ChadBadge } from 'pages/alpha/components/chad-badge'
import React from 'react'
import { cn } from 'utils/cn'
import { queryParams } from 'utils/query-params'

export const ChadExclusivesHeader = (props: { isChad?: boolean; className?: string }) => {
  const params = useQueryParams()

  return (
    <header className={cn('flex flex-col gap-2', props.className)}>
      <div className='flex items-center gap-3'>
        <h1 className='text-[1.75rem] leading-[2.375rem] font-bold'>Chad exclusives</h1>
        <button onClick={() => params.set(queryParams.chadEligibility, 'true')}>
          {props.isChad ? <ChadBadge /> : <ChadBadgeInactive />}
        </button>
      </div>
      <p className='text-sm text-secondary-800'>Handpicked rewards for Leap Chad users only</p>
    </header>
  )
}
