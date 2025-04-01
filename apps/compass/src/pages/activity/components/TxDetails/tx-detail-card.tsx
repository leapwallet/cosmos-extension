import { ActivityType } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useActivityImage } from 'hooks/activity/useActivityImage'
import React from 'react'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'

export const DetailsCard = (props: {
  title: string
  imgSrc: string | React.ReactNode
  subtitle: string
  trailing?: React.ReactNode
  txType?: ActivityType
  activeChain: SupportedChain
  className?: string
}) => {
  const defaultImg = useActivityImage(props.txType ?? 'fallback', props.activeChain)

  return (
    <div
      className={cn(
        'flex items-center p-5 gap-3 bg-secondary-100 rounded-xl w-full',
        props.className,
      )}
    >
      {typeof props.imgSrc === 'string' ? (
        <img src={props.imgSrc} onError={imgOnError(defaultImg)} className='size-10' />
      ) : (
        props.imgSrc
      )}

      <span className='flex flex-col gap-px'>
        <span className='text-sm font-medium text-muted-foreground'>{props.title}</span>
        <span className='font-bold text-base'>{props.subtitle}</span>
      </span>

      <span className={'text-muted-foreground ml-auto'}>{props.trailing}</span>
    </div>
  )
}
