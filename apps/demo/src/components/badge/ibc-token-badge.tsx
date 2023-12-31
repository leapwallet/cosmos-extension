import React from 'react'

import { sliceWord } from '~/util/strings'

import Badge, { BadgeProps } from './badge'

export default function IBCTokenBadge({ image, text }: BadgeProps) {
  const [originChain, channelId] = text.split('/')
  const chain = originChain.length > 16 ? sliceWord(originChain, 4) : originChain
  const chId = channelId.replace('channel', 'ch')

  return <Badge image={image} text={`${chain} / ${chId}`} />
}
