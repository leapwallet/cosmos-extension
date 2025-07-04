import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { Button } from 'components/ui/button'
import { PasswordInput } from 'components/ui/input/password-input'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'
import { LockIcon } from 'icons/lock'
import React, { Dispatch, ReactElement, SetStateAction, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  readonly rawPassword: string
}

type EnterPasswordViewProps = {
  readonly passwordTo: string
  readonly setRevealed: Dispatch<SetStateAction<boolean>>
  readonly setPassword: Dispatch<SetStateAction<Uint8Array | undefined>>
  readonly autoFocus?: boolean
}
export function EnterPasswordView({
  setRevealed,
  setPassword,
  passwordTo,
  autoFocus = false,
}: EnterPasswordViewProps): ReactElement {
  const testPassword = SeedPhrase.useTestPassword()
  const activeWallet = useActiveWallet()
  const formRef = useRef<HTMLFormElement>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({ mode: 'onChange' })

  const password = watch('rawPassword')

  const onSubmit = async (values: FormData) => {
    try {
      const cipher = activeWallet?.cipher
      if (!cipher) throw new Error('No cipher')
      const password = new TextEncoder().encode(values.rawPassword)
      await testPassword(password, cipher)
      setPassword(password)
      setRevealed(true)
    } catch (err) {
      setError('rawPassword', {
        type: 'validate',
        message: 'Incorrect Password',
      })
    } finally {
      // to clear password from heap
      setValue('rawPassword', '__')
      setValue('rawPassword', '')
    }
  }

  // delay auto focus to prevent jitter
  useEffect(() => {
    const passwordInput = formRef.current?.querySelector('#password') as HTMLInputElement
    if (!passwordInput || !autoFocus) {
      return
    }

    const timeout = setTimeout(() => {
      passwordInput.focus()
    }, 250)

    return () => clearTimeout(timeout)
  }, [autoFocus])

  return (
    <div className='flex flex-col gap-6 h-full'>
      <div className='p-5 bg-secondary-200 rounded-full grid place-content-center w-fit mx-auto'>
        <LockIcon size={24} />
      </div>

      <header className='flex flex-col items-center gap-2'>
        <span className='text-xl font-bold'>Verify it&apos;s you</span>
        <span className='text-sm'>Enter your wallet password to {passwordTo}</span>
      </header>

      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className='mt-2 flex-grow flex flex-col justify-start'
      >
        <PasswordInput
          id='password'
          type='password'
          placeholder='Enter password'
          {...register('rawPassword')}
          autoFocus={false}
          status={errors.rawPassword ? 'error' : 'default'}
        />

        {!!errors.rawPassword && (
          <span className='text-sm text-destructive-100 font-medium mt-2 text-center animate-fadeIn duration-100'>
            {errors.rawPassword?.message}
          </span>
        )}

        <Button disabled={!password} className='mt-auto'>
          Enter password
        </Button>
      </form>
    </div>
  )
}
