import React from 'react'

import EmptyCard from '~/components/empty-card'
import { Images } from '~/images'

interface PropsType {
  searchQuery: string
}

const NoSearchResults = (props: PropsType) => {
  return (
    <EmptyCard
      isRounded
      subHeading='Please try again with something else'
      heading={'No results for “' + props.searchQuery + '”'}
      src={Images.Misc.Explore}
    />
  )
}

export default NoSearchResults
