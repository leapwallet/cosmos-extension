import React, { useState } from 'react'

import Text, { TextProps } from '../text'

type ReadMoreProps = {
  textProps: TextProps
  children: string
  readMoreColor: string
}

export default function ReadMoreText({ children, textProps, readMoreColor: color }: ReadMoreProps) {
  const text = children
  const [isReadMore, setIsReadMore] = useState(true)
  const toggleReadMore = () => {
    setIsReadMore(!isReadMore)
  }

  const isPossible = text && text.length > 150

  return (
    <div>
      <Text size={textProps.size} className={textProps.className} color={textProps.color}>
        <span>{isReadMore && isPossible ? text.slice(0, 150).trim() + '...' : text}</span>
      </Text>
      {isPossible && (
        <span
          onClick={toggleReadMore}
          className='hover:cursor-pointer font-bold text-sm !leading-5 mt-2'
          style={{ color: color }}
        >
          {isReadMore ? 'See more' : 'See less'}
        </span>
      )}
    </div>
  )
}
