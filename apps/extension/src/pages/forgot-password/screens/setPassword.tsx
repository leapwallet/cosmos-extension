import { Buttons, Input } from '@leapwallet/leap-ui'
import { Lock } from '@phosphor-icons/react'
import PopupLayout from 'components/layout/popup-layout'
import Text from 'components/text'
import { Images } from 'images'
import React, { useCallback, useEffect, useState } from 'react'
import { Colors } from 'theme/colors'
import { getPassScore } from 'utils/passChecker'

interface PropsType {
  loading: boolean
  // eslint-disable-next-line no-unused-vars
  resetPassword: (password: string) => void
}

/**
 *
 * @decription This component is used to promt the user to enter their new passwords
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
    if (password1 != password2) {
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
      resetPassword(password1)
    }
  }

  return (
    <PopupLayout>
      <div className='flex flex-col h-full pt-[25%]'>
        <div className='mx-5 bg-gray-900 dark:bg-gray-100 rounded-[16px] mb-4 h-[36px] w-[36px] flex flex-col justify-center text-center'>
          <Lock size={20} className='dark:text-gray-900 text-gray-100' />
        </div>
        <Text size='xxl' className='font-bold px-5'>
          Choose a password
        </Text>
        <Text size='md' color='text-gray-500 dark:text-gray-300 mb-[32px] px-5'>
          Use this password to unlock your wallet
        </Text>
        <form onSubmit={handleSubmit} className='relative grid grid-cols-1 gap-y-[20px] mx-auto'>
          <Input
            type='password'
            placeholder='Enter password'
            className='pr-100'
            isErrorHighlighted={!!errors.pass1 || !!errors.pass2}
            onChange={(event) => {
              setErrors((e) => ({
                ...e,
                pass1: '',
              }))
              setPassword1(event.target.value)
            }}
          />
          {passScore !== null && (
            <div className='absolute flex justify-center items-center top-[1px] right-[10px] w-[80px] h-[45px] bg-white-100 dark:bg-gray-900'>
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
            type='password'
            placeholder='Re-enter password'
            isErrorHighlighted={!!errors.pass2}
            onChange={(event) => {
              setErrors((e) => ({
                ...e,
                pass2: '',
              }))
              setPassword2(event.target.value)
            }}
          />
          {errors.pass2 && (
            <Text size='sm' color='text-red-300'>
              {errors.pass2}
            </Text>
          )}
          <div className='w-full h-auto rounded-xl dark:bg-gray-900 bg-white-100 flex items-center p-[16px] pr-[21px]'>
            <img className='mr-[16px]' src={Images.Misc.Warning} />
            <div className='flex flex-col gap-y-[2px]'>
              <Text size='sm' className='font-black'>
                Recommended security practice:
              </Text>
              <Text size='xs' color='text-gray-400'>
                Always choose a strong password
              </Text>
            </div>
          </div>
          <div className='w-full shrink mt-[25px] flex flex-row justify-center'>
            <Buttons.Generic
              size='normal'
              type={arePasswordsEmpty ? 'button' : 'submit'}
              color={Colors.cosmosPrimary}
              style={{
                opacity: `${arePasswordsEmpty || loading ? '0.4' : '1'}`,
                background: Colors.cosmosPrimary,
              }}
              disabled={loading}
            >
              {loading ? 'Recovering Wallet...' : 'Recover Now'}
            </Buttons.Generic>
          </div>
        </form>
      </div>
    </PopupLayout>
  )
}

export default SetPassword
