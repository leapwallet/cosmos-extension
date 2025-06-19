import { ArrowLeft, Lock } from '@phosphor-icons/react'
import { Button } from 'components/ui/button'
import { Wallet } from 'hooks/wallet/useWallet'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const { removeAll } = Wallet.useRemoveWallet()

  const handleClearDataAndRestore = () => {
    removeAll(true)
    navigate('/onboardingImport')
  }

  return (
    <div className='p-5 flex flex-col h-full justify-center'>
      <nav>
        <button
          type='button'
          onClick={() => navigate('/')}
          className='p-2 rounded-full text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='size-5' />
          <span className='sr-only'>Go back</span>
        </button>
      </nav>

      <header className='flex flex-col gap-5 mb-5'>
        <div className='bg-secondary-200 rounded-full size-20 mx-auto flex items-center justify-center'>
          <Lock size={32} className='text-secondary-800' />
        </div>

        <span className='font-bold text-xl text-center'>Forgot your password?</span>
      </header>

      <div className='flex flex-col gap-4 mt-2'>
        <span className='text-secondary-foreground text-md'>
          Clear your data and restore your wallet using your recovery phrase
        </span>
        <span className='text-secondary-foreground text-md'>
          We won&apos;t be able to recover your password as it&apos;s stored securely only on your
          computer.
        </span>
        <span className='text-secondary-foreground text-md'>
          To recover the wallet you will have to clear you data which will delete your current
          wallet and recovery phrase from this device, along with the list of accounts you&apos;ve
          curated. After that you can restore you wallet using your recovery phrase
        </span>
      </div>
      <Button className='w-full mt-auto' onClick={handleClearDataAndRestore}>
        Clear data and restore
      </Button>
    </div>
  )
}

export default observer(ForgotPassword)
