import { sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import { buttonRingClass } from 'components/ui/button'
import { Images } from 'images'
import React from 'react'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'
import { sidePanel } from 'utils/isSidePanel'

type ValidatorCardProps = {
  onClick?: () => void
  imgSrc?: string
  moniker: string
  titleAmount: string
  subAmount: string
  jailed?: boolean
  disabled?: boolean
}

export const ValidatorCardView = React.memo(
  ({ onClick, imgSrc, moniker, titleAmount, subAmount, jailed, disabled }: ValidatorCardProps) => {
    return (
      <button
        disabled={disabled || !onClick}
        onClick={onClick}
        className={cn(
          'flex justify-between items-center px-4 py-3 bg-secondary-100 disabled:hover:bg-secondary-100 hover:bg-secondary-200 disabled:cursor-auto rounded-xl',
          buttonRingClass,
        )}
      >
        <img
          src={imgSrc ?? Images.Misc.Validator}
          onError={imgOnError(Images.Misc.Validator)}
          width={36}
          height={36}
          className='mr-4 rounded-full'
        />

        <div className='flex justify-between items-center w-full'>
          <div className='flex flex-col items-start gap-y-1'>
            <span className='font-bold text-sm overflow-hidden'>
              {sliceWord(
                moniker,
                sidePanel
                  ? 5 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                  : 10,
                3,
              )}
            </span>

            {jailed && <span className='font-medium text-xs text-destructive-100'>Jailed</span>}
          </div>

          <div className='flex flex-col items-end gap-y-0.5'>
            <span className='font-bold text-right text-sm'>{titleAmount}</span>
            <span className='font-medium text-right text-xs text-muted-foreground'>
              {subAmount}
            </span>
          </div>
        </div>
      </button>
    )
  },
)

ValidatorCardView.displayName = 'ValidatorCardView'
