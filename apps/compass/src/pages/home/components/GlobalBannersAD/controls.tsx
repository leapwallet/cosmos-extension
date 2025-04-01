import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import React from 'react'
import { cn } from 'utils/cn'

export const BannerControls = (props: {
  activeBannerIndex: number
  activeBannerId: string
  totalItems: number
  handleContainerScroll: (index: number) => void
  handleMouseEnter: () => void
  handleMouseLeave: () => void
}) => {
  const {
    activeBannerIndex,
    totalItems,
    handleContainerScroll,
    handleMouseEnter,
    handleMouseLeave,
  } = props

  return (
    <div className='flex w-full items-center px-4 justify-between mt-1'>
      <button>
        <ArrowLeft
          size={17}
          onClick={() => handleContainerScroll(activeBannerIndex - 1)}
          className={`text-muted-foreground hover:text-foreground cursor-pointer transition-[colors,opacity] duration-300 ${
            activeBannerIndex === 0 ? 'invisible opacity-0' : 'opacity-100'
          }`}
        />
      </button>

      <div className='flex gap-1' onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {Array.from({ length: totalItems }).map((_, i) => {
          const isActive = activeBannerIndex === i

          return (
            <button
              role='button'
              key={i}
              className={cn(
                'h-[5px] rounded-full cursor-pointer transition-all duration-300',
                isActive ? 'w-[20px] bg-accent-blue-200' : 'w-[5px] bg-muted-foreground',
              )}
              onClick={() => handleContainerScroll(i)}
            />
          )
        })}
      </div>
      <ArrowRight
        size={17}
        onClick={() => handleContainerScroll(activeBannerIndex + 1)}
        className={`text-muted-foreground hover:text-foreground cursor-pointer transition-[colors,opacity] duration-300 ${
          activeBannerIndex === totalItems - 1 ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  )
}
