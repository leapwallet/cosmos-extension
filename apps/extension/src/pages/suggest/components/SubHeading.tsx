import Text from 'components/text'
import React from 'react'

type SubHeadingProps = {
  text: string
}

export function SubHeading({ text }: SubHeadingProps) {
  return (
    <Text
      size='xs'
      className='font-bold text-center mt-[2px] max-w-[250px]'
      color='text-gray-800 dark:text-gray-600 mb-2'
    >
      {text}
    </Text>
  )
}
