import { GenericCard, GenericCardProps, Toggle } from '@leapwallet/leap-ui'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React from 'react'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'

type CustomToggleCardProps = GenericCardProps & {
  imgSrc?: string
  TokenType?: React.ReactNode
  onToggleChange: (isEnabled: boolean) => void
  isToggleChecked: boolean
  className?: string
  onDeleteClick: () => void
  imageClassName?: string
}

export function CustomToggleCard({
  title,
  subtitle,
  isRounded,
  imgSrc,
  TokenType,
  onToggleChange,
  isToggleChecked,
  onDeleteClick,
  className,
  imageClassName,
}: CustomToggleCardProps) {
  const defaultTokenLogo = useDefaultTokenLogo()

  return (
    <GenericCard
      title={title}
      subtitle={
        <p>
          {subtitle} {TokenType ?? null}
        </p>
      }
      isRounded={isRounded}
      size='md'
      img={
        <img
          src={imgSrc ?? defaultTokenLogo}
          className={cn('h-8 w-8 mr-3', imageClassName)}
          onError={imgOnError(defaultTokenLogo)}
        />
      }
      icon={
        <div className='flex items-center gap-[8px]'>
          <Toggle checked={isToggleChecked} onChange={onToggleChange} />

          <div className='h-[36px] w-[0.25px] bg-gray-200 dark:bg-gray-600' />

          <button className='cursor-pointer' onClick={onDeleteClick}>
            <img className='invert dark:invert-0' src={Images.Misc.DeleteRed} alt='remove' />
          </button>
        </div>
      }
      className={className}
    />
  )
}
