import { capitalize } from '@leapwallet/cosmos-wallet-hooks'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { LedgerAppId } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import React, { useState } from 'react'

import { useImportWalletContext } from '../import-wallet-context'

type Status = 'pending' | 'loading' | 'error' | 'success'

export const OpenAppView = () => {
  const [status, setStatus] = useState<Status>('pending')
  const {
    selectedApp: app,
    importLedger,
    getLedgerAccountDetailsForIdxs,
    moveToNextStep,
  } = useImportWalletContext()

  const connectApp = async () => {
    setStatus('loading')
    try {
      await importLedger(getLedgerAccountDetailsForIdxs)
      moveToNextStep()
    } catch (e) {
      setStatus('error')
    }
  }

  if (status === 'loading') {
    return (
      <div className='flex flex-col w-full relative mt-24 items-center'>
        <img
          src={Images.Misc.LedgerLoader}
          className='mb-6'
          width='134'
          height='134'
          alt='ledger-loader'
        />
        <Text size={'xl'} className='font-bold justify-center mb-2'>
          Finding your wallets
        </Text>
        <Text size='sm' className='justify-center' color='text-gray-200'>
          Gathering your wallets on {capitalize(app)} App.
        </Text>
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div className='flex flex-col w-full relative mt-24 items-center'>
        <img
          src={Images.Misc.LedgerError}
          className='mb-6'
          width='134'
          height='134'
          alt='ledger-loader'
        />
        <Text size={'xl'} className='font-bold justify-center mb-2'>
          Unable to connect to {capitalize(app)} App
        </Text>
        <Text size='sm' className='justify-center' color='text-gray-200'>
          Make sure your ledger is unlocked and {capitalize(app)} App is open
        </Text>
        <Button className={'w-full mt-36'} onClick={() => connectApp()}>
          Try again
        </Button>
      </div>
    )
  }
  return (
    <div className='flex flex-col w-full relative mt-24 items-center'>
      <img
        src={Images.Misc.LedgerLoader}
        className='mb-6'
        width='134'
        height='134'
        alt='ledger-loader'
      />
      <Text size={'xl'} className='font-bold justify-center mb-2'>
        Open {capitalize(app)} app on your Ledger
      </Text>
      <Text size='sm' className='justify-center' color='text-gray-200'>
        Make sure your ledger is unlocked and {capitalize(app)} App is open.
      </Text>
      <Button className={'w-full mt-36'} onClick={() => connectApp()}>
        Continue
      </Button>
    </div>
  )
}
