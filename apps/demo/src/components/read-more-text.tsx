import React, { useState } from 'react'

import Text, { Props as TextProps } from './text'

type ReadMoreProps = {
  textProps: Omit<TextProps, 'children'>
  readMoreColor: string
  children: React.ReactNode
}

const ReadMoreText: React.FC<ReadMoreProps> = ({ children, textProps, readMoreColor: color }) => {
  if (typeof children !== 'string') {
    throw new Error('ReadMoreText: children must be string')
  }
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
          className='hover:cursor-pointer font-bold'
          style={{ color: color }}
        >
          {isReadMore ? 'Read more' : 'Show less'}
        </span>
      )}
    </div>
  )
}

export default ReadMoreText
