import { isLedgerUnlocked } from '@leapwallet/cosmos-wallet-sdk'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { LedgerDriveIcon } from 'icons/ledger-drive-icon'
import { Images } from 'images'
import React, { useState } from 'react'

import { OnboardingWrapper } from '../../wrapper'
import { useImportWalletContext } from '../import-wallet-context'
import { LEDGER_CONNECTION_STEP } from '../types'

type ImportLedgerViewProps = {
  onNext: () => void
}

const transition = {
  duration: 0.75,
  ease: 'easeInOut',
}

const walletCableVariants: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0 },
}

const walletUsbVariants: Variants = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
}

export function ConnectLedger({ onNext }: ImportLedgerViewProps) {
  const { prevStep, currentStep } = useImportWalletContext()
  const [connectingLedger, setConnectingLedger] = useState(false)
  const entry = prevStep <= currentStep ? 'right' : 'left'

  const connectLedger = async () => {
    setConnectingLedger(true)
    isLedgerUnlocked('Ethereum', true).then((unlocked) => {
      if (unlocked) onNext()
    })
  }

  if (connectingLedger) {
    return (
      <div className='flex flex-col w-full relative mt-28 items-center'>
        <img
          src={Images.Misc.LedgerLoader}
          className='mb-6'
          width='134'
          height='134'
          alt='ledger-loader'
        />
        <Text size={'xl'} className='font-bold justify-center mb-2'>
          Searching for Ledger...
        </Text>
        <Text size='sm' className='justify-center' color='text-gray-200'>
          Connect and unlock your hardware wallet.
        </Text>
      </div>
    )
  }

  return (
    <OnboardingWrapper
      headerIcon={<LedgerDriveIcon className='size-6' />}
      heading='Connect your Ledger'
      subHeading={'Unlock Ledger & connect to your device via USB'}
      entry={entry}
    >
      {/* fixed height is hardcoded to avoid layout shift from transitions */}
      <div className='flex flex-col gap-4 w-full relative h-[220px] mt-10'>
        <div className='-mx-7 mt-7 flex items-center justify-between'>
          <AnimatePresence>
            <motion.img
              width={446}
              height={77}
              src={Images.Misc.HardwareWalletConnectCable}
              alt='Hardware Wallet Connect Cable'
              className='w-2/5'
              transition={transition}
              variants={entry === 'right' ? walletCableVariants : undefined} // disable animation for backward entry
              initial='hidden'
              animate='visible'
            />
            <motion.img
              width={446}
              height={77}
              src={Images.Misc.HardwareWalletConnectUsb}
              alt='Hardware Wallet Connect USB'
              className='w-3/5'
              transition={transition}
              variants={entry === 'right' ? walletUsbVariants : undefined} // disable animation for backward entry
              initial='hidden'
              animate='visible'
            />
          </AnimatePresence>
        </div>
      </div>

      <Button className={'w-full'} onClick={() => connectLedger()}>
        Continue
      </Button>
    </OnboardingWrapper>
  )
}
