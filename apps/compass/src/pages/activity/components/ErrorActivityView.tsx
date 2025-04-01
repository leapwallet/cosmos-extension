import { EmptyCard } from 'components/empty-card'
import { Images } from 'images'
import React from 'react'

import { CheckMoreLink } from './check-more-link'

type ErrorActivityViewProps = {
  accountExplorerLink: string
}

export function ErrorActivityView({ accountExplorerLink }: ErrorActivityViewProps) {
  return (
    <div className='flex flex-col h-[350px] mt-12'>
      <EmptyCard src={Images.Activity.ActivityIcon} heading='Unable to fetch activity' />

      {accountExplorerLink ? <CheckMoreLink href={accountExplorerLink} /> : null}
    </div>
  )
}
