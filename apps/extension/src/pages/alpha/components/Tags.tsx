import React from 'react'
import { cn } from 'utils/cn'

import { RaffleVisibilityStatus } from './alpha-timeline/use-raffle-status-map'

const Tag = (
  props: React.PropsWithChildren<{
    onClick?: () => void
    className?: string
  }>,
) => {
  return (
    <span
      className={cn(
        'text-xs font-medium h-6 px-2 flex items-center justify-center border bg-secondary hover:bg-secondary-200 rounded border-secondary-300 transition-colors',
        props.className,
      )}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        props.onClick?.()
      }}
    >
      {props.children}
    </span>
  )
}

export default function Tags({
  isLive,
  visibilityStatus,
  ecosystemFilter,
  categoryFilter,
  className,
  handleEcosystemClick,
  handleCategoryClick,
  handleLiveClick,
}: {
  isLive?: boolean
  visibilityStatus?: RaffleVisibilityStatus
  ecosystemFilter: string[]
  categoryFilter: string[]
  className?: string
  handleEcosystemClick?: (ecosystem: string) => void
  handleCategoryClick?: (category: string) => void
  handleLiveClick?: () => void
}) {
  return (
    <div className={cn('flex items-center justify-between w-full gap-2', className)}>
      <div className='flex flex-wrap gap-2'>
        {visibilityStatus === 'completed' && (
          <Tag
            className='bg-accent-foreground/10 hover:bg-accent-green-100 border-primary/40 text-accent-success'
            onClick={() => handleCategoryClick?.('Completed')}
          >
            Completed
          </Tag>
        )}
        {visibilityStatus === 'hidden' && (
          <Tag
            className='bg-destructive-100/20 hover:bg-destructive-red-100 border-destructive/40 text-destructive-error'
            onClick={() => handleCategoryClick?.('hidden')}
          >
            Hidden
          </Tag>
        )}
        {ecosystemFilter?.filter(Boolean).map((ecosystem) => (
          <Tag key={ecosystem} onClick={() => handleEcosystemClick?.(ecosystem)}>
            {ecosystem}
          </Tag>
        ))}
        {categoryFilter?.filter(Boolean).map((category) => (
          <Tag key={category} onClick={() => handleCategoryClick?.(category)}>
            {category}
          </Tag>
        ))}
      </div>

      {isLive && (
        <Tag
          className='bg-destructive-400 hover:bg-destructive-200 text-white-100 font-medium'
          onClick={handleLiveClick}
        >
          Live
        </Tag>
      )}
    </div>
  )
}
