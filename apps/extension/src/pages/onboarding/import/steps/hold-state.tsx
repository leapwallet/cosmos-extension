import { isLedgerUnlocked } from '@leapwallet/cosmos-wallet-sdk'
import { type IconProps } from '@phosphor-icons/react'
import { Button } from 'components/ui/button'
import { motion } from 'framer-motion'
import { onboardingWrapperVariants } from 'pages/onboarding/wrapper'
import React, { useEffect } from 'react'

import { LEDGER_NETWORK, useImportWalletContext } from '../import-wallet-context'

export const HoldState = ({
  Icon,
  title,
  cta,
  moveToNextApp,
  appType,
}: {
  Icon: (props: IconProps) => React.JSX.Element
  title: React.ReactNode
  cta?: React.ReactNode
  moveToNextApp: (appType: LEDGER_NETWORK) => void
  appType: LEDGER_NETWORK
}) => {
  const { getLedgerAccountDetails } = useImportWalletContext()

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const unlocked = await isLedgerUnlocked(
          appType === LEDGER_NETWORK.ETH ? 'Ethereum' : 'Cosmos',
        )
        if (unlocked) {
          await getLedgerAccountDetails(appType)
          moveToNextApp(appType)
          clearInterval(interval)
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }, 4000)

    return () => {
      clearInterval(interval)
    }
  }, [appType])

  return (
    <motion.div
      className='flex flex-col w-full flex-1'
      variants={onboardingWrapperVariants}
      initial={'fromRight'}
      animate='animate'
      exit='exit'
    >
      <header className='flex flex-col items-center justify-center gap-6 flex-1'>
        <div className='rounded-full size-[134px] animate-scaleUpDown [--scale-up-down-start:1.05] bg-accent-foreground/20 grid place-content-center'>
          <div className='rounded-full size-[89px] animate-scaleUpDown [--scale-up-down-start:1.075] bg-accent-foreground/40 grid place-content-center'>
            <div className='rounded-full size-[44.5px] animate-scaleUpDown [--scale-up-down-start:1.1] bg-accent-foreground grid place-content-center'>
              <Icon className='size-6' />
            </div>
          </div>
        </div>

        <span className='text-xl font-bold text-center'>{title}</span>
      </header>

      {Boolean(cta && moveToNextApp) && (
        <Button className='w-full' onClick={() => moveToNextApp(appType)}>
          {cta}
        </Button>
      )}
    </motion.div>
  )
}
