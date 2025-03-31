import Text from 'components/text'
import React from 'react'

type HeadingProps = {
  text: string
}

export function Heading({ text }: HeadingProps) {
  return (
    <Text size='lg' className='font-bold mt-5'>
      {text}
    </Text>
  )
}
