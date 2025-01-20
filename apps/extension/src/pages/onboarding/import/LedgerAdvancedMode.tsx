/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buttons, Input, ThemeName, Toggle, useTheme } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import Text from 'components/text'
import React, { ChangeEvent, useState } from 'react'
import { Colors } from 'theme/colors'

interface LedgerAdvancedModeProps {
  isAdvanceModeEnabled: boolean
  setIsAdvanceModeEnabled: React.Dispatch<React.SetStateAction<boolean>>
}

export default function LedgerAdvancedMode({
  isAdvanceModeEnabled,
  setIsAdvanceModeEnabled,
}: LedgerAdvancedModeProps) {
  const [walletName, setWalletName] = useState<string>('')
  const [derivationInput, setDerivationInput] = useState({
    index1: undefined,
    index2: undefined,
    index3: undefined,
  })

  const [errors, setErrors] = useState<any>()
  const { theme } = useTheme()

  const handleToggleChange = () => {
    setIsAdvanceModeEnabled(!isAdvanceModeEnabled)

    setErrors(undefined)
    setWalletName('')
    setDerivationInput({
      index1: undefined,
      index2: undefined,
      index3: undefined,
    })
  }

  const handleDerivationInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!Object.values(derivationInput).includes(undefined)) {
      setErrors((prevValue: any) => ({ ...prevValue, derivationInput: undefined }))
    }

    setDerivationInput({ ...derivationInput, [e.target.name]: e.target.value })
  }

  const onAdd = () => {
    if (!walletName) {
      setErrors((prevValue: any) => ({
        ...(prevValue ?? {}),
        walletName: 'Kindly enter wallet name to continue',
      }))
    }

    if (Object.values(derivationInput).includes(undefined)) {
      setErrors((prevValue: any) => ({
        ...(prevValue ?? {}),
        derivationInput: 'Wallet by this path already exists',
      }))
    }
  }

  return (
    <div className='shrink flex-col gap-y-[4px] w-[408px] p-[32px] rounded-lg border-[1px] dark:border-gray-800 border-gray-200'>
      <Text size='md' className='font-bold text-gray-600 dark:text-gray-200 mb-2'>
        Can I import a wallet with a custom derivation path?
      </Text>
      <Text size='sm' color='text-gray-600 dark:text-gray-400 mb-4'>
        Yes, you can import using custom derivation path by going into the advanced mode below. Head
        over to our blog page to learn more.
      </Text>

      <button className='font-base bg-gray-800 rounded-3xl text-white-100 font-medium px-3 py-[6px] mb-6'>
        Learn more
      </button>

      <div className='flex justify-between'>
        <Text size='lg' className='font-bold'>
          Advanced mode
        </Text>
        <Toggle checked={isAdvanceModeEnabled} onChange={handleToggleChange} />
      </div>

      <div
        className={classNames(`transition-all duration-300 ease`, {
          'opacity-0 h-[0%] mt-0 hidden': !isAdvanceModeEnabled,
          'opacity-1 h-full mt-6 block': isAdvanceModeEnabled,
        })}
      >
        <div className='bg-gray-50 dark:bg-gray-950 rounded-xl p-6'>
          <Text className='font-bold mb-3'>Wallet name</Text>
          <Input
            placeholder='Enter wallet name'
            value={walletName}
            name='walletName'
            onChange={(e) => {
              setErrors((prevValue: any) => ({ ...prevValue, walletName: undefined }))
              setWalletName(e.target.value)
            }}
            isErrorHighlighted={errors?.walletName}
            className={classNames('w-full', {
              '!border-gray-800': !errors?.walletName,
              '!border-red-300': errors?.walletName,
            })}
          />

          {!!errors?.walletName && (
            <Text size='sm' color='text-red-300' className='pt-2 font-medium'>
              {errors?.walletName}
            </Text>
          )}

          <Text className='font-bold mb-3 mt-8'>Custom derivation path</Text>

          <div className='flex items-center gap-2'>
            <Text className='font-medium'>m/44&apos;/...&apos;</Text>
            <Input
              placeholder='0'
              value={derivationInput.index1}
              name='index1'
              onChange={handleDerivationInputChange}
              className={classNames('w-14', {
                '!border-red-300': errors?.derivationInput,
                '!border-gray-800': !errors?.derivationInput,
              })}
              type='number'
              isErrorHighlighted={errors?.derivationInput}
            />

            <Text>&apos;/</Text>
            <Input
              placeholder='0'
              value={derivationInput.index2}
              name='index2'
              onChange={handleDerivationInputChange}
              className={classNames('w-14', {
                '!border-red-300': errors?.derivationInput,
                '!border-gray-800': !errors?.derivationInput,
              })}
              type='number'
              isErrorHighlighted={errors?.derivationInput}
            />

            <Text>/</Text>
            <Input
              placeholder='0'
              value={derivationInput.index3}
              name='index3'
              onChange={handleDerivationInputChange}
              className={classNames('w-14', {
                '!border-red-300': errors?.derivationInput,
                '!border-gray-800': !errors?.derivationInput,
              })}
              type='number'
              isErrorHighlighted={errors?.derivationInput}
            />
          </div>

          {!!errors?.derivationInput && (
            <Text size='sm' color='text-red-300' className='pt-2 font-medium'>
              {errors?.derivationInput}
            </Text>
          )}

          <Buttons.Generic
            color={theme === ThemeName.DARK ? Colors.white100 : 'black'}
            size='normal'
            className={classNames('w-full', {
              'mt-6': !!errors?.derivationInput,
              'mt-8': !errors?.derivationInput,
            })}
            onClick={onAdd}
          >
            <Text color='text-white-100 dark:text-black-100'>Add</Text>
          </Buttons.Generic>
        </div>
      </div>
    </div>
  )
}
