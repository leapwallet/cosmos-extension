import { sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import { Provider } from '@leapwallet/cosmos-wallet-sdk'
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import { CaretDown } from '@phosphor-icons/react'
import Text from 'components/text'
import { Images } from 'images'
import { GenericDark, GenericLight } from 'images/logos'
import React from 'react'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'

export type SelectProviderCardProps = {
  selectedProvider?: Provider
  setShowSelectProviderSheet: (val: boolean) => void
  selectDisabled: boolean
  title: string
  optional?: boolean
}

export default function SelectProviderCard({
  selectedProvider,
  setShowSelectProviderSheet,
  selectDisabled,
  title,
  optional,
}: SelectProviderCardProps) {
  const theme = useTheme().theme
  return (
    <div className='flex flex-col gap-y-3 p-4 rounded-2xl bg-white-100 dark:bg-gray-950'>
      <Text size='sm' color='text-black-100 dark:text-white-100' className='font-medium'>
        {title}
      </Text>
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
              ? sliceWord(
                  selectedProvider.moniker ?? '',
                  isSidePanel()
                    ? 20 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                    : 30,
                  0,
                )
              : `Select Provider ${optional ? '(optional)' : ''}`}
          </Text>
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
}
