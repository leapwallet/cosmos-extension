import { PasswordStrengthIndicator } from 'components/choose-password-view/password-strength'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import { PasswordInput } from 'components/ui/input/password-input'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import React, { useCallback, useEffect, useState } from 'react'
import { opacityFadeInOut, transition150 } from 'utils/motion-variants'
import { getPassScore } from 'utils/passChecker'

import { ForgotPasswordWrapper } from './wrapper'

const passwordErrorVariants: Variants = {
  hidden: { height: 0 },
  visible: { height: '2rem' },
}

interface PropsType {
  loading: boolean
  // eslint-disable-next-line no-unused-vars
  resetPassword: (password: Uint8Array) => void
}

/**
 *
 * @description This component is used to prompt the user to enter their new passwords
 * @param props PropsType - props.incrementStep() is called when the user clicks the button to move to the next step, props.setPasswordAtRoot() is called when the entered password is verified.
 * @returns React Component
 */
const SetPassword: React.FC<PropsType> = ({ loading, resetPassword }) => {
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [passScore, setPassScore] = useState<number | null>(null)
  const [errors, setErrors] = useState({
    pass1: '',
    pass2: '',
  })

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      getPassCheckData(password1)
    }, 200)

    return () => {
      clearTimeout(timeout)
    }
  }, [password1])

  /**
   * @description This function checks two entered passwords, errors and passscore to determine the output
   * @returns boolean
   */
  const arePasswordsEmpty =
    !!errors.pass1 || !!errors.pass2 || !password1.length || !password2.length

  const validateLength = useCallback((password1: string) => {
    setErrors({
      pass1: '',
      pass2: '',
    })
    if (password1.length < 8) {
      setErrors((e) => ({ ...e, pass1: 'Password must be at least 8 characters' }))
      return false
    }
    return true
  }, [])

  const validatePasswordMatch = () => {
    if (password1 !== password2) {
      setErrors((e) => ({ ...e, pass2: 'Passwords do not match' }))
      return false
    } else if (errors.pass1 || errors.pass2 || !validateLength(password1)) {
      return false
    }
    return true
  }

  /**
   * @description This function proceeds to the next step if the two entered passwords match
   * @returns null
   */
  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault()
    if (validatePasswordMatch()) {
      const password = new TextEncoder().encode(password1)
      resetPassword(password)
    }
  }

  return (
    <ForgotPasswordWrapper>
      <header className='flex flex-col gap-1'>
        <span className='font-bold text-xl text-center'>Choose a password</span>

        <span className='text-secondary-foreground text-sm text-center'>
          Use this password to unlock your wallet
        </span>
      </header>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4 mx-auto flex-1 w-full'>
        <div>
          <Input
            type='password'
            placeholder='Enter password'
            status={errors.pass1 || errors.pass2 ? 'error' : undefined}
            onChange={(event) => {
              setErrors((e) => ({
                ...e,
                pass1: '',
              }))
              setPassword1(event.target.value)
            }}
            onBlur={() => {
              validateLength(password1)
            }}
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

        <PasswordInput
          placeholder='Re-enter password'
          status={errors.pass2 ? 'error' : undefined}
          onChange={(event) => {
            setErrors((e) => ({
              ...e,
              pass2: '',
            }))
            setPassword2(event.target.value)
          }}
        />
        <AnimatePresence>
          {errors.pass2 && (
            <motion.span
              className='flex items-end justify-center text-destructive-100 text-xs text-center font-medium overflow-hidden'
              transition={transition150}
              variants={opacityFadeInOut}
              initial='hidden'
              animate='visible'
              exit='hidden'
            >
              {errors.pass2}
            </motion.span>
          )}
        </AnimatePresence>

        <Button className='mt-auto' disabled={loading || arePasswordsEmpty}>
          {loading ? 'Recovering Wallet...' : 'Recover Now'}
        </Button>
      </form>
    </ForgotPasswordWrapper>
  )
}

export default SetPassword
