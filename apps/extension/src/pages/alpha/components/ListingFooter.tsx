import Text from 'components/text'
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
    <div className='w-full flex gap-2 items-center'>
      {endDate && addedAt(additionDate) && (
        <>
          <Text size='xs' className='!text-gray-600 dark:!text-gray-400'>
            {endsIn(endDate)}
          </Text>
          <Text size='xs' className='!text-gray-600 dark:!text-gray-400'>
            ·
          </Text>
        </>
      )}
      {additionDate && relevantLinks?.[0] ? (
        <>
          <Text size='xs' className='!text-gray-600 dark:!text-gray-400'>
            {addedAt(additionDate)}
          </Text>
          <Text size='xs' className='!text-gray-600 dark:!text-gray-400'>
            ·
          </Text>
        </>
      ) : additionDate ? (
        <Text size='xs' className='!text-gray-600 dark:!text-gray-400'>
          {addedAt(additionDate)}
        </Text>
      ) : null}
      {relevantLinks?.[0] && (
        <Text size='xs' className='!text-gray-600 dark:!text-gray-400'>
          {getHostname(relevantLinks[0])}
        </Text>
      )}
    </div>
  )
}
