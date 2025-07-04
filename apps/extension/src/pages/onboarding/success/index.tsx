import { useAddress } from '@leapwallet/cosmos-wallet-hooks'
import { bech32ToEthAddress } from '@leapwallet/cosmos-wallet-sdk'
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
import React, { useEffect, useMemo, useState } from 'react'
import CanvasConfetti from 'react-canvas-confetti/dist/presets/fireworks'
import { createPortal } from 'react-dom'
import { handleSidePanelClick } from 'utils/isSidePanel'

import { OnboardingLayout } from '../layout'

const ctrlKey =
  typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac') ? 'Cmd' : 'Ctrl'

export default function OnboardingSuccess() {
  const activeWalletCosmosAddress = useAddress('cosmos')
  const activeWalletEvmAddress = useAddress('ethereum')
  const activeWalletSolanaAddress = useAddress('solana')
  const activeWalletSuiAddress = useAddress('sui')

  const activeWalletAddress = useMemo(
    () =>
      activeWalletCosmosAddress ||
      activeWalletEvmAddress ||
      activeWalletSolanaAddress ||
      activeWalletSuiAddress,
    [
      activeWalletCosmosAddress,
      activeWalletEvmAddress,
      activeWalletSolanaAddress,
      activeWalletSuiAddress,
    ],
  )

  useEffect(() => {
    const currentTime = new Date().getTime()
    const timeStarted1 = Number(localStorage.getItem('timeStarted1'))
    const timeStarted2 = Number(localStorage.getItem('timeStarted2'))
    const methodChosen = localStorage.getItem('onboardingMethodChosen')

    if (timeStarted1 && timeStarted2 && activeWalletAddress) {
      const hashedAddress = utils.bytesToHex(sha256(activeWalletAddress))

      try {
        mixpanel.track(EventName.OnboardingCompleted, {
          methodChosen,
          timeTaken1: dayjs(currentTime).diff(timeStarted1, 'seconds'),
          timeTaken2: dayjs(currentTime).diff(timeStarted2, 'seconds'),
          wallet: hashedAddress,
          time: Date.now() / 1000,
        })
      } catch (e) {
        captureException(e)
      }

      localStorage.removeItem('timeStarted1')
      localStorage.removeItem('timeStarted2')
      localStorage.removeItem('onboardingMethodChosen')
    }
  }, [activeWalletAddress])

  return (
    <>
      {createPortal(
        <>
          <Confetti />
          <PinButton />
        </>,
        document.body,
      )}

      <OnboardingLayout
        hideRightActions
        className='flex flex-col items-center gap-7 p-7 overflow-auto z-20 bg-background'
        style={{
          backgroundImage:
            'linear-gradient(180deg, hsl(var(--bg-linear-gradient-start) / 0.4) 19.35%, hsl(var(--bg-linear-gradient-end)/ 0.4) 80.65%)',
        }}
      >
        <div className='flex flex-col gap-y-8 my-auto'>
          <div className='w-32 h-auto mx-auto'>
            <img src={Images.Misc.OnboardingFrog} className='w-full h-full' />
          </div>

          <header className='flex flex-col gap-y-5 items-center text-center'>
            <h1 className='font-bold text-xxl'>You are all set!</h1>

            <span className='flex flex-col gap-y-1 text-muted-foreground text-md'>
              <span>Discover Cosmos, Ethereum & more with Leap.</span>
              <span>
                Open Leap with
                <span className='text-accent-foreground font-bold'> {ctrlKey}</span> +
                <span className='text-accent-foreground font-bold'> Shift</span> +
                <span className='text-accent-foreground font-bold'> L</span>
              </span>
            </span>
          </header>
        </div>

        <Button
          className='w-full'
          onClick={() => {
            handleSidePanelClick('https://app.leapwallet.io')
          }}
        >
          Get started
        </Button>
      </OnboardingLayout>
    </>
  )
}

const Confetti = () => {
  return (
    <CanvasConfetti
      className='w-full h-full absolute opacity-50 top-0 left-0 right-0 z-10 isolate'
      onInit={({ conductor }) => {
        conductor.run({
          speed: 1,
        })
        setTimeout(() => {
          conductor.stop()
        }, 5_000)
      }}
      globalOptions={{
        useWorker: true,
        resize: true,
      }}
    />
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
            <span className='text-sm font-bold w-32'>Pin Leap to your toolbar</span>

            <ArrowUp size={24} weight='bold' />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
