import { GenericCard, GenericCardProps, Toggle } from '@leapwallet/leap-ui'
import React, { ReactNode } from 'react'

export type NftToggleCardProps = Omit<GenericCardProps, 'onClick'> & {
  readonly avatar: ReactNode
  // eslint-disable-next-line no-unused-vars
  readonly onClick: (isEnable: boolean) => void
  readonly isEnabled: boolean
}

export function NftToggleCard({
  avatar,
  title,
  size,
  isRounded,
  isEnabled,
  onClick,
  ...rest
}: NftToggleCardProps) {
  return (
    <GenericCard
      img={<div className='mr-3'>{avatar}</div>}
      title={title}
      size={size}
      icon={<Toggle checked={isEnabled} onChange={onClick} />}
      isRounded={isRounded}
      {...rest}
    />
  )
}
