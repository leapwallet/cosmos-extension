import { useAddress } from '@leapwallet/cosmos-wallet-hooks'
import { sha256 } from '@noble/hashes/sha256'
import { utils } from '@noble/secp256k1'
import { ArrowUp } from '@phosphor-icons/react'
import { captureException } from '@sentry/react'
import { Button } from 'components/ui/button'
import { EventName } from 'config/analytics'
import dayjs from 'dayjs'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import React, { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import { createPortal } from 'react-dom'

import { OnboardingLayout } from '../layout'

const ctrlKey =
  typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac') ? 'Cmd' : 'Ctrl'

export default function OnboardingSuccess() {
  const activeWalletCosmosAddress = useAddress('seiTestnet2')

  useEffect(() => {
    const currentTime = new Date().getTime()
    const timeStarted1 = Number(localStorage.getItem('timeStarted1'))
    const timeStarted2 = Number(localStorage.getItem('timeStarted2'))
    const methodChosen = localStorage.getItem('onboardingMethodChosen')

    if (timeStarted1 && timeStarted2 && activeWalletCosmosAddress) {
      const hashedAddress = utils.bytesToHex(sha256(activeWalletCosmosAddress))

      localStorage.removeItem('timeStarted1')
      localStorage.removeItem('timeStarted2')
      localStorage.removeItem('onboardingMethodChosen')
    }
  }, [activeWalletCosmosAddress])

  return (
    <>
      {createPortal(
        <>
          <Confetti
            className='w-screen absolute opacity-50 top-0 left-0 right-0 z-[999999] isolate'
            numberOfPieces={1000}
            recycle={false}
          />

          <PinButton />
        </>,
        document.body,
      )}

      <OnboardingLayout
        hideRightActions
        className='flex flex-col items-center gap-7 p-7 overflow-auto'
      >
        <div className='flex flex-col gap-y-16 my-auto'>
          <div className='w-60 h-36 rounded-[1.25rem] mx-auto relative border border-secondary-300'>
            <img src={Images.Misc.OnboardingSuccess} className='w-full h-full' />
          </div>

          <header className='flex flex-col gap-y-5 items-center text-center'>
            <h1 className='font-bold text-xxl'>You&apos;re all set!</h1>

            <span className='flex flex-col gap-y-1 text-muted-foreground text-md'>
              <span>Discover the full power of SEI with Compass.</span>
              <span>
                Open compass with
                <span className='text-accent-blue font-bold'> {ctrlKey}</span> +
                <span className='text-accent-blue font-bold'> Shift</span> +
                <span className='text-accent-blue font-bold'> S</span>
              </span>
            </span>
          </header>
        </div>

        <Button
          className='w-full mt-auto'
          onClick={() => {
            chrome.action.openPopup()
          }}
        >
          Get started
        </Button>
      </OnboardingLayout>
    </>
  )
}

const transition = {
  duration: 0.3,
  ease: 'easeInOut',
}

const pinVariants: Variants = {
  show: {
    opacity: 1,
    y: 0,
  },
  hide: {
    opacity: 0,
    y: -10,
  },
}

const PinButton = () => {
  const [isPinned, setIsPinned] = useState(true)

  useEffect(() => {
    const checkPinned = setInterval(async () => {
      const userSettings = await chrome.action.getUserSettings()
      setIsPinned(userSettings?.isOnToolbar)
    }, 2000)

    return () => clearInterval(checkPinned)
  }, [])

  return (
    <AnimatePresence>
      {!isPinned && (
        <motion.div
          transition={transition}
          variants={pinVariants}
          initial='hide'
          animate='show'
          exit='hide'
          className='absolute top-0 right-10 z-10 rounded-b-xl px-9 flex items-center gap-3 bg-[hsl(var(--gradient-radial-mono-end))]'
        >
          <div className='text-white-100 bg-primary rounded-b-xl px-4 py-2 flex items-center gap-3'>
            <span className='text-sm font-bold w-32'>Pin Compass to your toolbar</span>

            <ArrowUp size={24} weight='bold' />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
