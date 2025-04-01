import { sliceWord, useValidatorImage } from '@leapwallet/cosmos-wallet-hooks'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/validators'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { Button } from 'components/ui/button'
import { PenIcon } from 'icons/pen-icon'
import { Images } from 'images'
import { GenericDark, GenericLight } from 'images/logos'
import React from 'react'
import { imgOnError } from 'utils/imgOnError'
import { sidePanel } from 'utils/isSidePanel'

export type SelectValidatorCardProps = {
  selectedValidator?: Validator
  setShowSelectValidatorSheet: (val: boolean) => void
  selectDisabled: boolean
  title: string
  apr?: number
  loading?: boolean
}

export default function SelectValidatorCard({
  selectedValidator,
  setShowSelectValidatorSheet,
  selectDisabled,
  title,
  apr,
  loading,
}: SelectValidatorCardProps) {
  const { data: imageUrl } = useValidatorImage(selectedValidator)
  const theme = useTheme().theme

  return (
    <div className='flex flex-col gap-4 p-5 rounded-xl bg-secondary-100'>
      <span className='font-medium text-sm text-muted-foreground'>{title}</span>
      <div className='flex w-full items-center cursor-pointer justify-between'>
        <div className='flex items-center gap-4'>
          <img
            src={
              selectedValidator
                ? imageUrl ?? selectedValidator?.image ?? Images.Misc.Validator
                : theme === ThemeName.DARK
                ? GenericDark
                : GenericLight
            }
            onError={imgOnError(GenericLight)}
            className='rounded-full'
            width={44}
            height={44}
          />
          <div className='flex flex-col gap-1'>
            <span className='font-bold text-sm'>
              {selectedValidator
                ? sliceWord(
                    selectedValidator.moniker ?? '',
                    sidePanel
                      ? 21 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                      : 30,
                    0,
                  )
                : loading
                ? 'Loading...'
                : 'Select Validator'}
            </span>
            {apr && !isNaN(+apr) && (
              <span className='text-xs text-accent-success font-medium'>
                {Number(apr * 100).toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        {!selectDisabled && !loading && (
          <Button
            size={'icon'}
            variant={'secondary'}
            className='bg-secondary-300 hover:bg-secondary-400'
            onClick={() => setShowSelectValidatorSheet(true)}
          >
            <PenIcon size={24} />
          </Button>
        )}
      </div>
    </div>
  )
}
