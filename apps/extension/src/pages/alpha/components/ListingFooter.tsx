import React from 'react'

import { addedAt, endsIn, getHostname } from '../utils'

export default function ListingFooter({
  endDate,
  additionDate,
  relevantLinks,
}: {
  endDate: string | undefined
  additionDate: string
  relevantLinks: string[]
}) {
  return (
    <div className='w-full flex gap-1 items-center text-xs text-secondary-800'>
      {endDate && addedAt(additionDate) && (
        <>
          <span>{endsIn(endDate)}</span>
          <span>·</span>
        </>
      )}
      {additionDate && relevantLinks?.[0] ? (
        <>
          <span>{addedAt(additionDate)}</span>
          <span>·</span>
        </>
      ) : additionDate ? (
        <span>{addedAt(additionDate)}</span>
      ) : null}
      {relevantLinks?.[0] && <span>{getHostname(relevantLinks[0])}</span>}
    </div>
  )
}
