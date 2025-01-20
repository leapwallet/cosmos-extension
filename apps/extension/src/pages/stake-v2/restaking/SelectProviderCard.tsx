import { formatPercentAmount, sliceWord, useProviderApr } from '@leapwallet/cosmos-wallet-hooks'
import { Provider } from '@leapwallet/cosmos-wallet-sdk'
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { CaretDown, Info } from '@phosphor-icons/react'
import Text from 'components/text'
import { Images } from 'images'
import { GenericDark, GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useState } from 'react'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'

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
      <div className='flex flex-col gap-y-3 p-4 rounded-2xl bg-white-100 dark:bg-gray-950 relative'>
        <div className='flex justify-between w-full'>
          <Text size='sm' color='text-black-100 dark:text-white-100' className='font-medium'>
            {title}
          </Text>
          {selectedProvider && (
            <div className='relative'>
              <Info
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                size={18}
                className='text-gray-400 dark:text-gray-600'
              />
              {showTooltip && (
                <ProviderTooltip
                  provider={selectedProvider}
                  handleMouseEnter={handleMouseEnter}
                  handleMouseLeave={handleMouseLeave}
                  positionClassName='bottom-full -right-2 py-3'
                />
              )}
            </div>
          )}
        </div>
        <button
          className='flex w-full items-center cursor-pointer py-2.5 px-4 justify-between bg-gray-50 dark:bg-gray-900 rounded-xl'
          onClick={() => {
            if (!selectDisabled) {
              setShowSelectProviderSheet(true)
            }
          }}
          disabled={selectDisabled}
        >
          <div className='flex items-center gap-x-2'>
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
              width={24}
              height={24}
            />
            <Text
              size='sm'
              color={
                selectedProvider
                  ? 'text-black-100 dark:text-white-100'
                  : 'text-gray-700 dark:text-gray-400'
              }
              className=' font-bold'
            >
              {selectedProvider
                ? sliceWord(selectedProvider.moniker ?? '', 12, 0)
                : `Select Provider ${optional ? '(optional)' : ''}`}
            </Text>
            {selectedProvider && parseFloat(apr ?? '0') > 0 && (
              <Text size='xs' color='dark:text-gray-400 text-gray-600' className='font-medium'>
                Estimated APR&nbsp;
                <span className='font-bold'>{formatPercentAmount(apr ?? '', 1)}</span>%
              </Text>
            )}
          </div>
          {!selectDisabled && (
            <CaretDown
              size={16}
              className={`${
                selectedProvider
                  ? 'text-gray-800 dark:text-white-100'
                  : 'text-gray-700 dark:text-gray-400'
              }`}
            />
          )}
        </button>
      </div>
    )
  },
)
