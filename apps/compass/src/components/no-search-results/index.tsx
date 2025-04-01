import { EmptyCard } from 'components/empty-card'
import { Images } from 'images'
import React from 'react'

interface PropsType {
  searchQuery: string
  classname?: string
}

const NoSearchResults = (props: PropsType) => {
  const { searchQuery, classname = undefined } = props
  return (
    <EmptyCard
      isRounded
      subHeading='Please try again with something else'
      heading={'No results for “' + searchQuery + '”'}
      src={Images.Misc.Explore}
      classname={classname}
    />
  )
}

export default NoSearchResults
