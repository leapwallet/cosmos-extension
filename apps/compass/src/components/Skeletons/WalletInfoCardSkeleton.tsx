import { Checkbox } from 'components/ui/check-box'
import { Skeleton } from 'components/ui/skeleton'
import React, { HTMLAttributes } from 'react'
import { cn } from 'utils/cn'

export function WalletInfoCardSkeleton(props: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-row gap-3 items-center p-5 w-full cursor-pointer select-none',
        props.className,
      )}
    >
      <Skeleton className='size-10 rounded-full shrink-0' />
      <div className='flex flex-col w-full justify-center gap-2 h-11'>
        <Skeleton className={'bg-secondary-400 w-20 h-3 mt-1'} />
        <Skeleton className={'bg-secondary-400 w-20 h-2 mt-1'} />
      </div>

      <Checkbox disabled />
    </div>
  )
}

type WalletInfoCardSkeletonsProps = HTMLAttributes<HTMLDivElement> & {
  cardClassName?: string
  count: number
}

export function WalletInfoCardSkeletons({
  cardClassName,
  count,
  ...props
}: WalletInfoCardSkeletonsProps) {
  return (
    <div {...props}>
      {Array.from({ length: count }).map((_, index) => (
        <WalletInfoCardSkeleton key={index} className={cardClassName} />
      ))}
    </div>
  )
}
