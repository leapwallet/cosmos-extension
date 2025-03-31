import { CheckCircle } from '@phosphor-icons/react/dist/ssr'
import { Button } from 'components/ui/button'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { LedgerDriveIcon } from 'icons/ledger-drive-icon'
import { Images } from 'images'
import React from 'react'

import { OnboardingWrapper } from '../wrapper'
import { useImportWalletContext } from './import-wallet-context'
import { LEDGER_CONNECTION_STEP } from './types'

type ImportLedgerViewProps = {
  error?: string
  retry: VoidFunction
  onNext: () => void
  onSkip?: () => void // TODO: Remove extra prop
  status: LEDGER_CONNECTION_STEP
}

const stepsData = [
  {
    description: 'Unlock your Ledger and connect it to your device by a USB',
  },
  {
    description: 'Open Cosmos App on your ledger',
  },
]

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

export default function ImportLedgerView({ onNext, status }: ImportLedgerViewProps) {
  const { prevStep, currentStep } = useImportWalletContext()
  const entry = prevStep <= currentStep ? 'right' : 'left'

  return (
    <OnboardingWrapper
      headerIcon={<LedgerDriveIcon className='size-6' />}
      heading='Connect your Ledger'
      entry={entry}
    >
      {/* fixed height is hardcoded to avoid layout shift from transitions */}
      <div className='flex flex-col gap-4 w-full relative h-[301px]'>
        {stepsData.map((d, index) => (
          <div
            key={index}
            className='bg-secondary-200 py-4 px-5 w-full rounded-xl text-sm font-medium flex items-center gap-4'
          >
            <CheckCircle weight='bold' className='size-5 shrink-0 text-muted-foreground' />
            {d.description}
          </div>
        ))}
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

      <Button
        className={'w-full mt-auto'}
        disabled={status === LEDGER_CONNECTION_STEP.step2}
        onClick={onNext}
      >
        {status === LEDGER_CONNECTION_STEP.step2 ? 'Looking for device...' : 'Continue'}
      </Button>
    </OnboardingWrapper>
  )
}
