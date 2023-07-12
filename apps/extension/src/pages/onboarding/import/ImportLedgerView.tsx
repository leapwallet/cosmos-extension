import { Buttons } from '@leapwallet/leap-ui'
import { useChainInfos } from 'hooks/useChainInfos'
import React from 'react'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'

import ScanningAnimation from '../../../components/loader/Scanning'
import Text from '../../../components/text'

type ImportLedgerViewProps = {
  error: string
  retry: VoidFunction
}

export default function ImportLedgerView({ error, retry }: ImportLedgerViewProps) {
  const chainInfos = useChainInfos()
  return (
    <div className='flex flex-col items-center pb-5'>
      <Text size='xxl' className='font-bold mb-8'>
        Connect Hardware Wallet
      </Text>
      {!error ? (
        <>
          <ScanningAnimation />
          <Text size='lg' className='font-bold'>
            Looking for your wallet...
          </Text>
          <Text size='md' color='text-gray-400'>
            Connect your wallet directly to your computer, and approve HID
          </Text>
          <Text size='md' color='text-gray-400' className='mb-4'>
            connection. Please make sure your device is unlocked.
          </Text>
          {/*<Text size='md' color='text-gray-400'>*/}
          {/*  For more on using hardware wallet with Leap&nbsp;*/}
          {/*  <span className='text-green-600'>click here.</span>*/}
          {/*</Text>*/}
        </>
      ) : (
        <>
          <div className='flex items-center justify-center bg-red-600 dark:bg-red-300 h-[48px] w-[48px] mb-6 rounded-[16px]'>
            <span className='material-icons-round text-white-100'>error_outline</span>
          </div>
          <Text size='lg' color='text-red-600 dark:text-red-300' className='font-bold'>
            Hardware wallet not connected
          </Text>
          <Text size='md' color='text-gray-600 dark:text-gray-200 mb-8'>
            {error}
          </Text>
          <Buttons.Generic
            onClick={retry}
            color={isCompassWallet() ? Colors.compassPrimary : chainInfos.cosmos.theme.primaryColor}
          >
            Try Again
          </Buttons.Generic>
        </>
      )}
    </div>
  )
}
