import { KeyChain } from '@leapwallet/leap-keychain'
import { captureException } from '@sentry/react'
import { Button } from 'components/ui/button'
import { EventName } from 'config/analytics'
import { AuthContextType, useAuth } from 'context/auth-context'
import { motion, useAnimate, Variants } from 'framer-motion'
import { HappyFrog } from 'icons/frog'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { passwordStore } from 'stores/password-store'
import { hasMnemonicWallet } from 'utils/hasMnemonicWallet'
import { preloadOnboardingRoutes } from 'utils/preload'
import extension from 'webextension-polyfill'

import { OnboardingLayout } from './layout'

const transition = {
  duration: 0.25,
  delay: 1.05,
  ease: 'easeOut',
}

const headerTextVariants: Variants = {
  hidden: { opacity: 0, y: '-25%' },
  visible: { opacity: 1, y: 0 },
}

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: '25%' },
  visible: { opacity: 1, y: 0 },
}

const backgroundGradient =
  'linear-gradient(180deg, hsl(var(--bg-linear-gradient-start) / 1) 19.35%, hsl(var(--bg-linear-gradient-end)/ 1) 80.65%)'

const OnboardingView = ({
  navigate,
  trackCTAEvent,
}: {
  navigate: (path: string) => void
  trackCTAEvent: (methodChosen: string) => void
}) => {
  const [scope, animate] = useAnimate()

  const intiAnimation = useCallback(async () => {
    const logoId = '#leap-logo'
    const backgroundGradientId = '#background-gradient'

    const logoUpScale = 1.3334
    const yShift = 120

    await Promise.all([
      animate(logoId, { y: yShift }, { duration: 0 }),
      animate(backgroundGradientId, { opacity: 0.4 }, { duration: 0 }),
    ])

    await Promise.all([
      animate(
        logoId,
        { scale: logoUpScale, y: yShift },
        {
          duration: 0.25,
          ease: 'easeOut',
        },
      ),
      animate(
        backgroundGradientId,
        { opacity: 0.75 },
        {
          duration: 0.25,
        },
      ),
    ])

    await Promise.all([
      animate(
        logoId,
        { scale: 1, y: yShift },
        {
          delay: 0.25,
          duration: 0.25,
          ease: 'easeOut',
        },
      ),
      animate(
        backgroundGradientId,
        { opacity: 0.4 },
        {
          delay: 0.25,
          duration: 0.25,
        },
      ),
    ])

    await Promise.all([
      animate(
        logoId,
        { scale: logoUpScale, y: 0 },
        {
          delay: 0.25,
          duration: 0.2,
          ease: 'easeOut',
        },
      ),
      animate(
        backgroundGradientId,
        { opacity: 1 },
        {
          delay: 0.25,
          duration: 0.25,
        },
      ),
    ])
  }, [animate])

  useEffect(() => {
    intiAnimation()
  }, [intiAnimation])

  return (
    <div ref={scope} className='flex flex-col flex-1 w-full p-7 isolate'>
      <div
        id='background-gradient'
        style={{ backgroundImage: backgroundGradient }}
        className='absolute inset-0 -z-10'
      />

      <div className='flex flex-col gap-6 items-center justify-center flex-1'>
        <HappyFrog
          id='leap-logo'
          className='size-[5.625rem]'
          style={{ transform: 'translateY(120px)' }}
        />

        <motion.span
          key='main-text'
          initial='hidden'
          animate='visible'
          variants={headerTextVariants}
          transition={transition}
          className='flex flex-col gap-4'
        >
          <span className='text-center text-xxl font-bold text-secondary-foreground'>
            Leap everywhere
          </span>
          <span className='text-center text-xl text-secondary-800'>
            Multi-chain wallet for Cosmos, Ethereum, Solana, Bitcoin & more
          </span>
        </motion.span>
      </div>

      <motion.div
        className='flex flex-col gap-y-4 w-full mt-auto'
        initial='hidden'
        animate='visible'
        variants={buttonVariants}
        transition={transition}
      >
        <Button
          className='w-full'
          data-testing-id='create-new-wallet'
          onClick={() => {
            navigate('/onboardingCreate')
            trackCTAEvent('new')
          }}
        >
          Create a new wallet
        </Button>

        <Button
          variant='mono'
          className='w-full'
          data-testing-id='import-existing-wallet'
          onClick={() => {
            navigate('/onboardingImport')
            trackCTAEvent('import-seed-phrase')
          }}
        >
          Import an existing wallet
        </Button>
      </motion.div>
    </div>
  )
}

export default observer(function Onboarding() {
  const navigate = useNavigate()
  const { loading, noAccount } = useAuth() as AuthContextType

  const trackCTAEvent = (methodChosen: string) => {
    try {
      mixpanel.track(EventName.OnboardingMethod, { methodChosen, time: Date.now() / 1000 })
    } catch (e) {
      captureException(e)
    }

    localStorage.setItem('onboardingMethodChosen', methodChosen)
    localStorage.setItem('timeStarted2', new Date().getTime().toString())
  }

  useEffect(() => {
    ;(async () => {
      const wallets = await KeyChain.getAllWallets()

      if (loading === false && hasMnemonicWallet(wallets)) {
        if (!noAccount || passwordStore.password) {
          navigate('/onboardingSuccess')
        }
      }
    })()
  }, [loading, navigate, noAccount, passwordStore.password])

  useEffect(() => {
    preloadOnboardingRoutes()

    extension.extension.getViews({ type: 'popup' })

    const timeStarted1 = localStorage.getItem('timeStarted1')
    if (!timeStarted1) {
      localStorage.setItem('timeStarted1', new Date().getTime().toString())
    }

    try {
      mixpanel.track(EventName.OnboardingStarted, {
        firstWallet: true,
        time: Date.now() / 1000,
      })
    } catch (e) {
      captureException(e)
    }
  }, [])

  if (loading) {
    return null
  }

  return (
    <OnboardingLayout className='flex flex-col gap-y-5 justify-center items-center grow'>
      <OnboardingView navigate={navigate} trackCTAEvent={trackCTAEvent} />
    </OnboardingLayout>
  )
})
