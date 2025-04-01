import { KeyChain } from '@leapwallet/leap-keychain'
import { captureException } from '@sentry/react'
import { Button } from 'components/ui/button'
import { EventName } from 'config/analytics'
import { AuthContextType, useAuth } from 'context/auth-context'
import { motion, Variants } from 'framer-motion'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { passwordStore } from 'stores/password-store'
import { hasMnemonicWallet } from 'utils/hasMnemonicWallet'
import { preloadOnboardingRoutes } from 'utils/preload'
import extension from 'webextension-polyfill'

import { OnboardingLayout } from './layout'

const logoTransition = {
  duration: 0.5,
  ease: 'easeOut',
}

const headerLogoVariants: Variants = {
  hidden: { opacity: 0, y: '100%', scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: '-100%', scale: 0.95 },
}

const transition = {
  duration: 0.5,
  delay: 0.3,
  ease: 'easeOut',
}

const headerTextVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: '25%' },
  visible: { opacity: 1, y: 0 },
}

const containerTransition = {
  duration: 1,
  ease: 'easeOut',
}

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    backgroundImage:
      'linear-gradient(147.73deg, hsl(var(--bg-linear-gradient-start)) 19.35%, hsl(var(--bg-linear-gradient-end)) 80.65%)',
  },
  visible: {
    opacity: 1,
    backgroundImage:
      'linear-gradient(250deg, hsl(var(--bg-linear-gradient-start)) 19.35%, hsl(var(--bg-linear-gradient-end)) 80.65%)',
  },
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
    <OnboardingLayout
      className='flex flex-col gap-y-5 justify-center items-center p-7 grow'
      transition={containerTransition}
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      <div className='flex flex-col gap-6 items-center justify-center flex-1'>
        <motion.img
          key='logo'
          src={Images.Logos.CompassFullLogo}
          className='h-9 w-[16.5rem]'
          alt='Compass Logo'
          variants={headerLogoVariants}
          initial='hidden'
          animate='visible'
          transition={logoTransition}
        />
        <motion.span
          key='text'
          className='text-center text-mdl text-secondary-foreground'
          variants={headerTextVariants}
          initial='hidden'
          animate='visible'
          transition={transition}
        >
          The only SEI wallet you will ever need!
        </motion.span>
      </div>

      <motion.div
        className='flex flex-col gap-y-4 w-full mt-auto'
        variants={buttonVariants}
        initial='hidden'
        animate='visible'
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
    </OnboardingLayout>
  )
})
