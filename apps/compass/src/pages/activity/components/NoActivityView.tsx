import { EmptyCard } from 'components/empty-card'
import { Images } from 'images'
import React from 'react'

import { CheckMoreLink } from './check-more-link'

type NoActivityViewProps = {
  accountExplorerLink?: string
}

export function NoActivityView({ accountExplorerLink }: NoActivityViewProps) {
  return (
    <div className='flex flex-col h-[350px] mt-12'>
      <EmptyCard
        src={Images.Activity.ActivityIcon}
        heading='No activity'
        subHeading='Your activity will appear here'
      />

      {accountExplorerLink ? <CheckMoreLink href={accountExplorerLink} /> : null}
    </div>
  )
}
