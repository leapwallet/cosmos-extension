import { Buttons, Input } from '@leapwallet/leap-ui'
import CssLoader from 'components/css-loader/CssLoader'
import Text from 'components/text'
import { useSetPassword } from 'hooks/settings/usePassword'
import { Images } from 'images'
import React, { useCallback, useEffect, useState } from 'react'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'
import { getPassScore } from 'utils/passChecker'

type ViewProps = {
  // eslint-disable-next-line no-unused-vars
  readonly onProceed: (password: string) => void
}

export default function ChoosePasswordView({ onProceed }: ViewProps) {
  const [isLoading, setLoading] = useState(false)
  const [passScore, setPassScore] = useState<number | null>(null)
  const [termsOfUseAgreedCheck, setTermsOfUseAgreedCheck] = useState(true)
  const setPassword = useSetPassword()
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

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await setPassword(passwords.pass1)
      await onProceed(passwords.pass1)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (validatePasswordMatch()) {
      await handleSubmit()
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
    if (passwords.pass1.length != 0) validateLength()
  }, [passwords.pass1, validateLength])

  useEffect(() => {
    const timeout = setTimeout(() => {
      getPassCheckData(passwords.pass1)
    }, 500)

    return () => {
      clearTimeout(timeout)
    }
  }, [passwords.pass1])

  return (
    <div className='flex flex-row gap-x-[20px]'>
      <div className='flex flex-col w-[408px]'>
        <div className='flex flex-row gap-x-[12px]'>
          <img src={Images.Misc.LockFilled} width='32' height='32' />
          <Text size='xxl' className='font-medium'>
            Choose a Password
          </Text>
        </div>
        <Text size='md' color='text-gray-400' className='font-medium mb-[32px]'>
          Use this password to unlock your wallet
        </Text>
        <form onSubmit={onSubmit}>
          <div className='relative flex flex-col gap-y-[20px]'>
            <Input
              autoFocus
              placeholder='Enter password'
              type='password'
              name='pass1'
              onKeyDown={handleKeyDown}
              value={passwords.pass1}
              isErrorHighlighted={!!errors.pass1 || !!errors.pass2}
              onChange={handleInputChange}
              data-testing-id='input-password'
            />
            {passScore !== null && (
              <div className='absolute flex justify-center items-center top-[1px] right-[40px] w-[80px] h-[45px] bg-white-100 dark:bg-gray-900'>
                {passScore === 4 && (
                  <Text size='md' color='text-green-600 dark:text-green-300 px-5 font-bold'>
                    Strong
                  </Text>
                )}
                {passScore === 3 && (
                  <Text size='md' color='text-orange-500 dark:text-orange-300 px-5 font-bold'>
                    Medium
                  </Text>
                )}
                {passScore < 3 && (
                  <Text size='md' color='text-red-300 dark:text-red-300 px-5 font-bold'>
                    Weak
                  </Text>
                )}
              </div>
            )}
            {errors.pass1 && (
              <Text size='sm' color='text-red-300'>
                {errors.pass1}
              </Text>
            )}
            <Input
              name='pass2'
              value={passwords.pass2}
              placeholder='Re-enter password'
              type='password'
              onKeyDown={handleKeyDown}
              isErrorHighlighted={!!errors.pass2}
              onChange={handleInputChange}
              data-testing-id='input-confirm-password'
            />
            {errors.pass2 && (
              <Text size='sm' color='text-red-300' data-testing-id='password-error-ele'>
                {errors.pass2}
              </Text>
            )}
          </div>
          <div className='w-[376px] h-auto rounded-xl dark:bg-gray-900 bg-white-100 flex items-center px-4 py-3 my-7'>
            <img className='mr-[16px]' src={Images.Misc.Warning} width='40' height='40' />
            <div className='flex flex-col gap-y-[2px]'>
              <Text size='sm' color='text-gray-400 font-bold'>
                Recommended security practice:
              </Text>
              <Text size='md' color='font-bold text-white-100'>
                Always choose a <span className='text-green-300'>&nbsp;strong&nbsp;</span> password
              </Text>
            </div>
          </div>
          {isLoading ? (
            <Buttons.Generic
              color={Colors.cosmosPrimary}
              type='button'
              className='flex items-center'
            >
              <CssLoader />
            </Buttons.Generic>
          ) : (
            <Buttons.Generic
              disabled={isSubmitDisabled || isLoading || !termsOfUseAgreedCheck}
              color={Colors.cosmosPrimary}
              type='submit'
              data-testing-id='btn-password-proceed'
            >
              Proceed
            </Buttons.Generic>
          )}
          {error && (
            <Text size='sm' color='text-red-300 text-center justify-center w-[376px] mt-[5px]'>
              {error}
            </Text>
          )}

          {!isCompassWallet() && (
            <div className='flex flex-row items-center mt-6'>
              <input
                type='checkbox'
                id='terms'
                name='terms'
                value='terms'
                className='cursor-pointer mr-2 h-4 w-4 bg-black-50'
                checked={termsOfUseAgreedCheck}
                onChange={(e) => setTermsOfUseAgreedCheck(e.target.checked)}
              />
              <Text size='md' color='text-gray-400'>
                By proceeding, you agree to our
                <a
                  href='https://www.leapwallet.io/terms'
                  target='_blank'
                  rel='noreferrer'
                  className='text-indigo-300 font-medium ml-1'
                >
                  Terms of Use
                </a>
              </Text>
            </div>
          )}
        </form>
      </div>
      <div>
        <div className='shrink flex-col gap-y-[4px] w-[408px] p-[32px] rounded-lg border-[1px] border-gray-800'>
          <Text size='md' className='font-bold' color='text-gray-200'>
            {' '}
            Why do I need to enter a password?
          </Text>
          <Text size='sm' color='text-gray-400 mb-[32px] font-medium mt-1'>
            {' '}
            For your wallet protection, {isCompassWallet() ? 'Compass' : 'Leap'} locks your wallet
            after 15 minutes of inactivity. You will need this password to unlock it.
          </Text>

          <Text size='md' className='font-bold' color='text-gray-200'>
            {' '}
            Can I recover a password?
          </Text>
          <Text size='sm' color='text-gray-400 font-medium mt-1'>
            The password is stored securely on your device. We will not be able to recover it for
            you, so make sure you remember it!
          </Text>
        </div>
      </div>
    </div>
  )
}
