import { isValidWalletAddress } from '@leapwallet/cosmos-wallet-sdk'
import { Button } from 'components/ui/button'
import { Input } from 'components/ui/input'
import { TextareaWithPaste } from 'components/ui/input/textarea-with-paste'
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { EyeIcon } from 'icons/eye-icon'
import { OnboardingWrapper } from 'pages/onboarding/wrapper'
import React, { useState } from 'react'
import { transition150 } from 'utils/motion-variants'

import { useImportWalletContext } from '../import-wallet-context'

const errorVariants: Variants = {
  hidden: { opacity: 0, y: -10, height: 0 },
  visible: { opacity: 1, y: 0, height: 'auto' },
}

export const ImportWatchWallet = () => {
  const {
    prevStep,
    currentStep,
    watchWalletAddress,
    setWatchWalletAddress,
    watchWalletName,
    setWatchWalletName,
    moveToNextStep,
  } = useImportWalletContext()
  const [error, setError] = useState('')

  const onImportWallet = () => {
    if (!watchWalletAddress) {
      setError('')
      return
    }

    if (!isValidWalletAddress(watchWalletAddress)) {
      setError('Invalid public address, please enter a valid address')
      return
    }

    setError('')
    moveToNextStep()
  }

  return (
    <OnboardingWrapper
      headerIcon={<EyeIcon className='size-6' />}
      heading={'Watch wallet'}
      subHeading={`Add a wallet address you'd like to watch.`}
      entry={prevStep <= currentStep ? 'right' : 'left'}
      className='gap-10'
    >
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col'>
          <TextareaWithPaste
            autoFocus
            onChange={(value: string) => {
              setError('')
              setWatchWalletAddress(value)
            }}
            value={watchWalletAddress}
            error={error}
            placeholder='Public address'
            data-testing-id='enter-watch-address'
          />

          <AnimatePresence>
            {error && (
              <motion.span
                className='text-xs font-medium text-destructive-100 block text-center'
                data-testing-id='error-text-ele'
                transition={transition150}
                variants={errorVariants}
                initial='hidden'
                animate='visible'
                exit='hidden'
              >
                <span className='mt-2 block'>{error}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <Input
          placeholder='Name your wallet (optional)'
          maxLength={24}
          value={watchWalletName?.replace(LEDGER_NAME_EDITED_SUFFIX_REGEX, '')}
          onChange={(e) => setWatchWalletName(e.target.value)}
          trailingElement={
            watchWalletName?.length > 0 ? (
              <span className='text-muted-foreground text-sm font-medium'>{`${watchWalletName?.length}/24`}</span>
            ) : null
          }
        />
      </div>

      <Button
        data-testing-id='btn-import-wallet'
        className='mt-auto w-full'
        disabled={!!error || !watchWalletAddress || !watchWalletName}
        onClick={onImportWallet}
      >
        Start watching
      </Button>
    </OnboardingWrapper>
  )
}
