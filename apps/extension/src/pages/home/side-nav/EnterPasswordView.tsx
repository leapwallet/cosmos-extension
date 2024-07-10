import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { Buttons, Header, HeaderActionType, Input } from '@leapwallet/leap-ui'
import Resize from 'components/resize'
import Text from 'components/text'
import { useChainPageInfo } from 'hooks'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'
import React, { Dispatch, ReactElement, SetStateAction } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  readonly password: string
}

type EnterPasswordViewProps = {
  readonly passwordTo: string
  readonly setRevealed: Dispatch<SetStateAction<boolean>>
  readonly setPassword: Dispatch<SetStateAction<string>>
  readonly goBack: () => void
}

export function EnterPasswordView({
  setRevealed,
  setPassword,
  passwordTo,
  goBack,
}: EnterPasswordViewProps): ReactElement {
  const testPassword = SeedPhrase.useTestPassword()
  const activeWallet = useActiveWallet()
  const { topChainColor } = useChainPageInfo()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({ mode: 'onChange' })

  const onSubmit = (e?: React.BaseSyntheticEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleSubmit(async (values: any) => {
      try {
        const cipher = activeWallet?.cipher
        if (!cipher) throw new Error('No cipher')
        await testPassword(values.password, cipher)
        setPassword(values.password)
        setRevealed(true)
      } catch (err) {
        setError('password', {
          type: 'validate',
          message: 'Incorrect Password',
        })
      }
    })(e)
  }

  return (
    <div className='h-[600px]'>
      <Header title='Enter Password' action={{ type: HeaderActionType.BACK, onClick: goBack }} />
      <div className='relative flex flex-col items-center h-[528px] px-7'>
        <div className='dark:bg-gray-900 bg-white-100 rounded-2xl mt-7'>
          <div
            style={{ fontSize: 48 }}
            className='p-[12px] material-icons-round text-gray-400 dark:text-white-100'
          >
            lock
          </div>
        </div>
        <Text
          size='lg'
          data-testing-id='password-verify-you-text'
          className='dark:text-white-100 text-gray-900 font-bold mt-4 text-center'
        >
          Verify it&apos;s you
        </Text>
        <Text size='md' color='dark:text-gray-400 text-gray-700 mt-2 text-center'>
          Enter your wallet password to {passwordTo}
        </Text>
        <form className='mt-8 flex-grow flex flex-col justify-start' onSubmit={onSubmit}>
          <Resize>
            <Input
              autoFocus
              type='password'
              data-testing-id='password'
              placeholder='Enter password'
              {...register('password')}
              isErrorHighlighted={!!errors.password}
            />
          </Resize>
          <Text
            size='sm'
            data-testing-id='error-text'
            color='text-red-300'
            className='justify-center text-center pt-2'
          >
            {!!errors.password && errors.password.message}
          </Text>
          <Resize className='mt-auto mb-7'>
            <Buttons.Generic type='submit' color={topChainColor} data-testing-id='submit'>
              Proceed
            </Buttons.Generic>
          </Resize>
        </form>
      </div>
    </div>
  )
}
