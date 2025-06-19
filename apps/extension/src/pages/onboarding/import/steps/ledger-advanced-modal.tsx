/* eslint-disable @typescript-eslint/no-explicit-any */
import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { LoaderAnimation } from 'components/loader/Loader'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import { cn } from 'utils/cn'

function removeLeadingZero(input: string) {
  return Number(input).toString()
}

interface LedgerAdvancedModeProps {
  isAdvanceModeEnabled: boolean
  setIsAdvanceModeEnabled: React.Dispatch<React.SetStateAction<boolean>>
  getCustomLedgerAccountDetails: (
    useEvmApp: boolean,
    customDerivationPath: string,
    name: string,
    existingAddresses: string[] | undefined,
  ) => Promise<void>
  existingAddresses: string[] | undefined
  setSelectedIds: (val: { [id: number]: boolean }) => void
  selectedIds: { [id: string]: boolean }
}

export const LedgerAdvancedMode = ({
  isAdvanceModeEnabled,
  setIsAdvanceModeEnabled,
  getCustomLedgerAccountDetails,
  existingAddresses,
  setSelectedIds,
  selectedIds,
}: LedgerAdvancedModeProps) => {
  const [walletName, setWalletName] = useState<string>('')
  const [derivationInput, setDerivationInput] = useState<{
    index1: string
    index2: '0' | '1'
    index3: string
  }>({
    index1: '0',
    index2: '0',
    index3: '0',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    walletName?: string
    derivationInput?: string
    addError?: string
  }>({})
  const { theme } = useTheme()
  const isDisabled = useMemo(() => {
    return (
      !walletName ||
      Object.values(derivationInput).filter((value) => value === '0').length === 3 ||
      !!Object.values(derivationInput).some((value) => value === undefined || value === '') ||
      !!errors['derivationInput'] ||
      isLoading
    )
  }, [derivationInput, errors, walletName, isLoading])

  const handleDerivationInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputName = e.target.name
    const value = e.target.value
    const index2Range = (input: string) => parseInt(input) === 0 || parseInt(input) === 1
    if (inputName === 'index2' && !index2Range(value)) return

    setDerivationInput({ ...derivationInput, [e.target.name]: removeLeadingZero(e.target.value) })
  }

  const clearFields = () => {
    setErrors({})
    setWalletName('')

    setDerivationInput({
      index1: '0',
      index2: '0',
      index3: '0',
    })
  }

  useEffect(() => {
    if (!isAdvanceModeEnabled) {
      clearFields()
    }
  }, [isAdvanceModeEnabled])

  useEffect(() => {
    if (Object.values(derivationInput).every((value) => !value || parseInt(value) >= 0)) {
      setErrors((prevValue: any) => ({ ...prevValue, derivationInput: undefined }))
      return
    }
    setErrors((prevValue: any) => ({
      ...prevValue,
      derivationInput: 'Kindly enter a valid derivation path',
    }))
  }, [derivationInput])

  const onAdd = async () => {
    try {
      setIsLoading(true)
      if (!walletName) {
        setErrors((prevValue: any) => ({
          ...(prevValue ?? {}),
          walletName: 'Kindly enter wallet name to continue',
        }))
        setIsLoading(false)
        return
      }
      if (parseInt(derivationInput.index1) > 100 || parseInt(derivationInput.index3) > 100) {
        setErrors((prevValue) => ({
          ...(prevValue ?? {}),
          derivationInput:
            'Please enter a value between 0 - 100 for Account and Address index fields',
        }))
        setIsLoading(false)
        return
      }

      // if (Object.values(derivationInput).includes(undefined)) {
      //   setErrors((prevValue: any) => ({
      //     ...(prevValue ?? {}),
      //     derivationInput: 'Kindly enter a valid derivation path',
      //   }))
      //   setIsLoading(false)
      //   return
      // }
      const input = `${derivationInput.index1}'/${derivationInput.index2}/${derivationInput.index3}`
      await getCustomLedgerAccountDetails(false, input, walletName, existingAddresses)

      const hdPath = `m/44'/118'/${input}`
      setSelectedIds({ ...selectedIds, [hdPath]: true })
      setIsLoading(false)
      clearFields()
      setIsAdvanceModeEnabled(false)
    } catch (error) {
      setIsLoading(false)
      // eslint-disable-next-line no-console
      console.error('ledger advanced mode error', error)
      setErrors((prevValue: any) => ({
        ...(prevValue ?? {}),
        addError: (error as Error)?.message ?? 'Path does not seem to be valid',
      }))
    }
  }
  return (
    <BottomModal
      isOpen={isAdvanceModeEnabled}
      onClose={() => setIsAdvanceModeEnabled(false)}
      title='Advanced mode'
    >
      <Text className='font-medium mb-4' size='md'>
        Wallet name
      </Text>
      <Input
        autoComplete='off'
        placeholder='Enter wallet name'
        value={walletName}
        name='walletName'
        onChange={(e) => {
          setErrors((prevValue: any) => ({ ...prevValue, walletName: undefined }))
          setWalletName(e.target.value)
        }}
        className={classNames('w-full h-[58px] !text-md', {
          '!border-gray-800 mb-10': !errors?.walletName,
          '!border-red-300 mb-2': errors?.walletName,
        })}
        status={errors?.walletName ? 'error' : undefined}
      />

      {!!errors?.walletName && (
        <Text size='sm' color='text-red-300' className='mb-3 font-medium'>
          {errors?.walletName}
        </Text>
      )}

      <Text className='font-medium' size='md'>
        Custom derivation path
      </Text>

      <div className='flex items-center gap-4 w-full mt-4 mb-5'>
        <Text className='font-bold' color='text-secondary-800' size='sm'>
          m/44&apos;/...&apos;
        </Text>
        <Input
          placeholder='0'
          name='index1'
          autoComplete='off'
          onChange={handleDerivationInputChange}
          className={classNames('w-[81.67px] overflow-hidden', {
            '!border-red-300': errors?.derivationInput,
            '!border-gray-800': !errors?.derivationInput,
          })}
          inputClassName='!text-center !w-full'
          type='number'
          status={errors?.derivationInput ? 'error' : undefined}
        />

        <Text className='font-bold' color='text-secondary-800' size='sm'>
          &apos;/
        </Text>
        <Input
          placeholder='0'
          autoComplete='off'
          name='index2'
          disabled={true}
          min='0'
          max='1'
          onChange={handleDerivationInputChange}
          className='w-[81.67px] overflow-hidden border-gray-300 opacity-50'
          pattern='[01]'
          maxLength={1}
          step='1'
          inputClassName='!text-center !w-full'
          type='text'
        />

        <Text className='font-bold' color='text-secondary-800' size='sm'>
          /
        </Text>
        <Input
          placeholder='0'
          name='index3'
          autoComplete='off'
          onChange={handleDerivationInputChange}
          className={classNames('w-[81.67px] overflow-hidden', {
            '!border-red-300': errors?.derivationInput,
            '!border-gray-800': !errors?.derivationInput,
          })}
          inputClassName='!text-center !w-full'
          type='number'
          step='1'
          status={errors?.derivationInput ? 'error' : undefined}
        />
      </div>

      {!!(errors?.derivationInput ?? errors?.addError) && (
        <Text size='sm' color='text-red-300' className='font-medium mt-2'>
          {errors?.derivationInput ?? errors?.addError}
        </Text>
      )}

      <Button
        color={theme === ThemeName.DARK ? Colors.white100 : 'black'}
        className={cn('w-full overflow-hidden', {
          'opacity-50': isDisabled,
          'mt-10': !(errors?.derivationInput ?? errors?.addError),
          'mt-5': !!(errors?.derivationInput ?? errors?.addError),
        })}
        onClick={onAdd}
        disabled={isDisabled}
      >
        {isLoading ? (
          <LoaderAnimation color={Colors.white100} className='w-10 h-10' />
        ) : (
          <>Confirm and proceed</>
        )}
      </Button>
    </BottomModal>
  )
}
