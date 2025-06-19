import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import { Lock } from '@phosphor-icons/react'
import Resize from 'components/resize'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import { useChainPageInfo } from 'hooks'
import { SeedPhrase } from 'hooks/wallet/seed-phrase/useSeedPhrase'
import React, { Dispatch, ReactElement, SetStateAction } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  readonly rawPassword: string
}

type EnterPasswordViewProps = {
  readonly passwordTo: string
  readonly setRevealed: Dispatch<SetStateAction<boolean>>
  readonly setPassword: Dispatch<SetStateAction<Uint8Array | undefined>>
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
    setValue,
  } = useForm<FormData>({ mode: 'onChange' })

  const onSubmit = (e?: React.BaseSyntheticEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleSubmit(async (values: FormData) => {
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
    })(e)
  }

  return (
    <div className='panel-height flex flex-col'>
      <Header title='Enter Password' action={{ type: HeaderActionType.BACK, onClick: goBack }} />
      <div className='relative flex flex-col items-center p-5 flex-1'>
        <div className='dark:bg-gray-900 bg-white-100 rounded-2xl mt-7'>
          <div className='p-[12px] text-gray-400 dark:text-white-100'>
            <Lock size={48} />
          </div>
        </div>
        <span
          data-testing-id='password-verify-you-text'
          className='text-lg font-bold mt-4 text-center'
        >
          Verify it&apos;s you
        </span>
        <span className='text-muted-foreground mt-2 text-center font-medium'>
          Enter your wallet password to <br />
          {passwordTo}
        </span>
        <form className='mt-8 flex-grow flex flex-col justify-start' onSubmit={onSubmit}>
          <Resize>
            <Input
              autoFocus
              type='password'
              data-testing-id='password'
              placeholder='Enter password'
              {...register('rawPassword')}
              status={errors.rawPassword ? 'error' : 'default'}
            />
          </Resize>
          <Text
            size='sm'
            data-testing-id='error-text'
            color='text-red-300'
            className='justify-center text-center pt-2'
          >
            {!!errors.rawPassword && errors?.rawPassword?.message}
          </Text>

          <Button className='w-full mt-auto' color={topChainColor} data-testing-id='submit'>
            Proceed
          </Button>
        </form>
      </div>
    </div>
  )
}
