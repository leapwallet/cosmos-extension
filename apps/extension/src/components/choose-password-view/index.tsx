import { Button } from 'components/ui/button'
import { Checkbox } from 'components/ui/check-box'
import { Input } from 'components/ui/input'
import { PasswordInput } from 'components/ui/input/password-input'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { PasswordLockIcon } from 'icons/password-lock-icon'
import { OnboardingWrapper } from 'pages/onboarding/wrapper'
import React, { useCallback, useEffect, useState } from 'react'
import { errorVariants } from 'utils/motion-variants'
import { getPassScore } from 'utils/passChecker'

import { CreatingWalletLoader } from '../../pages/onboarding/create/creating-wallet-loader'
import { PasswordStrengthIndicator } from './password-strength'

type ViewProps = {
  readonly onProceed: (password: Uint8Array) => void
  readonly entry?: 'left' | 'right'
}

const passwordErrorVariants: Variants = {
  hidden: { height: 0 },
  visible: { height: '2rem' },
}

export default function ChoosePasswordView({ onProceed, entry }: ViewProps) {
  const [isLoading, setLoading] = useState(false)
  const [passScore, setPassScore] = useState<number | null>(null)
  const [termsOfUseAgreedCheck, setTermsOfUseAgreedCheck] = useState(true)
  const [error, setError] = useState('')

  const [passwords, setPasswords] = useState({
    pass1: '',
    pass2: '',
  })

  const [errors, setErrors] = useState({
    pass1: '',
    pass2: '',
  })

  const validateLength = useCallback(() => {
    setErrors({
      pass1: '',
      pass2: '',
    })
    if (passwords.pass1.length < 8) {
      setErrors((e) => ({ ...e, pass1: 'Password must be at least 8 characters' }))
      return false
    }
    return true
  }, [passwords.pass1.length])

  const validatePasswordMatch = useCallback(() => {
    if (passwords.pass1 != passwords.pass2) {
      setErrors((e) => ({ ...e, pass2: 'Passwords do not match' }))
      return false
    } else if (errors.pass1 || errors.pass2 || !validateLength()) {
      return false
    }
    return true
  }, [errors.pass1, errors.pass2, passwords.pass1, passwords.pass2, validateLength])

  /**
   * Sets the state of passScore
   *
   * @description This function is used to update the password strength meter data
   * @param password - user entered password string
   * @returns null
   *
   */
  const getPassCheckData = async (password: string) => {
    if (password) {
      const score = getPassScore(password)
      setPassScore(score)
    } else {
      setPassScore(null)
    }
  }

  const handleSubmit = () => {
    try {
      setLoading(true)
      const textEncoder = new TextEncoder()
      const password = textEncoder.encode(passwords.pass1)
      onProceed(password)
    } catch (error: unknown) {
      setError((error as Error)?.message)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    if (validatePasswordMatch()) {
      handleSubmit()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    error && setError('')

    type ErrorsKey = 'pass1' | 'pass2'
    if (errors[name as ErrorsKey]) {
      delete errors[name as ErrorsKey]
      setErrors(errors)
    }

    setPasswords({ ...passwords, [name]: value })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key.toLowerCase() === 'enter') {
      const target = event.target as HTMLInputElement
      if (target.name === 'pass2' && validatePasswordMatch()) {
        handleSubmit()
      }
      const form = target.form as HTMLFormElement
      const index = [...form].indexOf(target)
      ;(form.elements[index + 1] as HTMLInputElement).focus()
      event.preventDefault()
    }
  }

  const isSubmitDisabled = !!errors.pass1 || !!errors.pass2 || !passwords.pass1 || !passwords.pass2

  useEffect(() => {
    const timeout = setTimeout(() => {
      getPassCheckData(passwords.pass1)
    }, 500)

    return () => {
      clearTimeout(timeout)
    }
  }, [passwords.pass1])

  if (isLoading) {
    return <CreatingWalletLoader />
  }

  return (
    <form onSubmit={onSubmit} className='flex flex-col h-full'>
      <OnboardingWrapper
        headerIcon={<PasswordLockIcon className='size-6' />}
        entry={entry}
        heading='Create your password'
        subHeading='Choose a password to secure & lock your wallet'
        className='gap-0'
      >
        <div className='flex flex-col gap-y-5 w-full mt-10'>
          <div className='relative flex flex-col w-full'>
            <Input
              autoFocus
              placeholder='Enter password'
              type='password'
              name='pass1'
              onKeyDown={handleKeyDown}
              onBlur={validateLength}
              status={errors.pass1 || errors.pass2 ? 'error' : undefined}
              value={passwords.pass1}
              onChange={handleInputChange}
              data-testing-id='input-password'
              className='h-[3.625rem]'
              trailingElement={<PasswordStrengthIndicator score={passScore} />}
            />

            <AnimatePresence>
              {errors.pass1 && (
                <motion.span
                  className='flex items-end justify-center text-destructive-100 text-xs text-center font-medium overflow-hidden'
                  variants={passwordErrorVariants}
                  initial='hidden'
                  animate='visible'
                  exit='hidden'
                >
                  {errors.pass1}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className='relative flex flex-col gap-y-5 w-full'>
            <PasswordInput
              name='pass2'
              value={passwords.pass2}
              placeholder='Confirm password'
              onKeyDown={handleKeyDown}
              className='h-[3.625rem]'
              onChange={handleInputChange}
              status={errors.pass2 ? 'error' : undefined}
              data-testing-id='input-confirm-password'
            />
            <AnimatePresence>
              {(errors.pass2 || error) && (
                <motion.span
                  className='text-destructive-100 text-xs text-center font-medium'
                  data-testing-id='password-error-ele'
                  variants={errorVariants}
                  initial='hidden'
                  animate='visible'
                  exit='hidden'
                >
                  {errors.pass2 || error}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <label htmlFor='terms' className='flex flex-row justify-center items-center mt-auto'>
          <Checkbox
            id='terms'
            name='terms'
            value='terms'
            className='cursor-pointer mr-2 h-4 w-4 accent-accent-foreground'
            checked={termsOfUseAgreedCheck}
            onCheckedChange={(e) => {
              setTermsOfUseAgreedCheck(!!e)
            }}
          />

          <p className='text-xs text-muted-foreground text-center'>
            I agree to the{' '}
            <a
              href={'https://leapwallet.io/terms'}
              target='_blank'
              rel='noreferrer'
              className={`text-accent-foreground hover:text-accent-foreground/80 transition-colors`}
            >
              Terms & Conditions
            </a>
          </p>
        </label>

        <Button
          className='w-full mt-5'
          data-testing-id='btn-password-proceed'
          disabled={isSubmitDisabled || isLoading || !termsOfUseAgreedCheck}
        >
          Set Password
        </Button>
      </OnboardingWrapper>
    </form>
  )
}
