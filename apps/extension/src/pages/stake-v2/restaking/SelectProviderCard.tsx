import { formatPercentAmount, sliceWord, useProviderApr } from '@leapwallet/cosmos-wallet-hooks'
import { Provider } from '@leapwallet/cosmos-wallet-sdk'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { CaretDown, Info } from '@phosphor-icons/react'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'components/ui/tooltip'
import { PenIcon } from 'icons/pen-icon'
import { Images } from 'images'
import { GenericDark, GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useState } from 'react'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel, sidePanel } from 'utils/isSidePanel'

import ProviderTooltip from './ProviderTooltip'

export type SelectProviderCardProps = {
  selectedProvider?: Provider
  setShowSelectProviderSheet: (val: boolean) => void
  selectDisabled: boolean
  title: string
  optional?: boolean
  rootDenomsStore: RootDenomsStore
}

export const SelectProviderCard = observer(
  ({
    selectedProvider,
    setShowSelectProviderSheet,
    selectDisabled,
    title,
    optional,
    rootDenomsStore,
  }: SelectProviderCardProps) => {
    const theme = useTheme().theme
    const { apr } = useProviderApr(selectedProvider?.provider ?? '', rootDenomsStore.allDenoms)
    const [showTooltip, setShowTooltip] = useState(false)

    const handleMouseEnter = useCallback(() => {
      setShowTooltip(true)
    }, [])
    const handleMouseLeave = useCallback(() => {
      setShowTooltip(false)
    }, [])

    return (
      <div className='flex flex-col gap-4 p-5 rounded-xl bg-secondary-100'>
        <div className='flex justify-between w-full'>
          <span className='font-medium text-sm text-muted-foreground'>{title}</span>
          {selectedProvider && (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger>
                  <Info size={18} className='text-gray-400 dark:text-gray-600' />
                </TooltipTrigger>
                <TooltipContent side='left' className='bg-transparent border-none'>
                  <ProviderTooltip provider={selectedProvider} />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className='flex w-full items-center cursor-pointer justify-between'>
          <div className='flex items-center gap-4'>
            <img
              src={
                selectedProvider
                  ? Images.Misc.Validator
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
                {selectedProvider
                  ? sliceWord(
                      selectedProvider.moniker,
                      sidePanel
                        ? 21 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                        : 30,
                      0,
                    )
                  : `Select Provider ${optional ? '(optional)' : ''}`}
              </span>
              {selectedProvider && parseFloat(apr ?? '0') > 0 && (
                <span className='text-xs text-accent-success font-medium'>
                  Estimated APR&nbsp;
                  <span className='font-bold'>{formatPercentAmount(apr ?? '', 1)}</span>%
                </span>
              )}
            </div>
          </div>

          {!selectDisabled && (
            <Button
              size={'icon'}
              variant={'secondary'}
              className='bg-secondary-300 hover:bg-secondary-400'
              onClick={() => setShowSelectProviderSheet(true)}
            >
              <PenIcon size={24} />
            </Button>
          )}
        </div>
      </div>
    )
  },
)
