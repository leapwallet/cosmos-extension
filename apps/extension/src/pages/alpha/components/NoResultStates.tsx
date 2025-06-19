import React from 'react'

import EmptyBookmarks from './EmptyBookmarks'

type FilterType = 'upcoming' | 'live' | 'ended' | 'search' | 'no-results'

const filterTypeMap: Record<FilterType, { title: string; subTitle: string }> = {
  upcoming: {
    title: 'No upcoming rewards yet',
    subTitle: "You're early! New Chad-exclusive rewards are coming soon. Check back again.",
  },
  live: {
    title: 'No live rewards yet',
    subTitle: 'Check back again soon for new rewards',
  },
  ended: {
    title: 'No ended rewards yet',
    subTitle: 'Check back again soon for new rewards',
  },
  search: {
    title: 'No Results Found',
    subTitle: 'Try searching with different keywords',
  },
  'no-results': {
    title: 'No Results Found',
    subTitle: 'Try clearing filters',
  },
}

export const NoFilterResult = ({
  filterType = 'no-results',
  className,
}: {
  filterType?: FilterType
  className?: string
}) => {
  return (
    <EmptyBookmarks
      className={className}
      title={filterTypeMap[filterType].title}
      subTitle={filterTypeMap[filterType].subTitle}
    />
  )
}
