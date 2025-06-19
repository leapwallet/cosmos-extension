import { useTheme } from '@leapwallet/leap-ui'
import { CrownIcon } from 'icons/crown'
import React from 'react'

const chadBadgeActiveGradient = {
  background: 'linear-gradient(225deg, #29A874 1.39%, #10422E 98.61%)',
}

const chadBadgeActiveGradientLight = {
  background: 'linear-gradient(225deg, #4BCB8F 1.39%, #1A6B4A 98.61%)',
}

export const ChadBadge = () => {
  const { theme } = useTheme()

  const badgeGradient = theme === 'light' ? chadBadgeActiveGradientLight : chadBadgeActiveGradient

  return (
    <div
      className='flex items-center gap-1 py-1 px-2 w-fit rounded-lg text-xs font-medium text-white-100'
      style={badgeGradient}
    >
      <CrownIcon className='size-4' />
      <span className='leading-relaxed'>Chad</span>
    </div>
  )
}

const chadBadgeInactiveGradient = {
  background: 'linear-gradient(225deg, #101113 1.39%, #424242 98.61%)',
}

const chadBadgeInactiveGradientLight = {
  background: 'linear-gradient(225deg, #717171a8 1.39%, #9E9E9E 98.61%)',
}

export const ChadBadgeInactive = () => {
  const { theme } = useTheme()

  const badgeGradient =
    theme === 'light' ? chadBadgeInactiveGradientLight : chadBadgeInactiveGradient

  return (
    <div
      className='flex items-center gap-1 py-1 px-2 w-fit rounded-lg text-xs font-medium text-white-100'
      style={badgeGradient}
    >
      <CrownIcon className='size-4' />
      <span className='leading-relaxed'>Chad Inactive</span>
    </div>
  )
}
