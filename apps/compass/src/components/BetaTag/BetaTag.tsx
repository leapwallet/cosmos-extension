import Text from 'components/text'
import React from 'react'
import { Colors } from 'theme/colors'

export const BetaTag = ({ className }: { className?: string }) => {
  return (
    <Text
      size='xs'
      color={Colors.green600}
      className={`absolute border-none z-10  px-[10px] py-[3px] text-green-500 bg-green-300/10 rounded-2xl font-medium ${className}`}
    >
      Beta
    </Text>
  )
}
