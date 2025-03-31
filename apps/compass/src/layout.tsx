import { Question } from '@phosphor-icons/react'
import { routeToLabelMap } from 'components/bottom-nav/bottom-nav-items'
import BottomNav from 'components/bottom-nav/BottomNav'
import { Button } from 'components/ui/button'
import ImportWatchWalletSeedPopup from 'components/watch-watch/ImportWatchWalletSeedPopup'
import { useAuth } from 'context/auth-context'
import { AnimatePresence, motion } from 'framer-motion'
import { CompassFullLogo } from 'icons/compass-full-logo'
import { observer } from 'mobx-react-lite'
import { CopyAddressSheet } from 'pages/home/components'
import SideNav from 'pages/home/side-nav'
import React, { PropsWithChildren, ReactNode } from 'react'
import { Location } from 'react-router'
import { cn } from 'utils/cn'
import { sidePanel } from 'utils/isSidePanel'
import {
  opacityVariants,
  slideVariants,
  transition,
} from 'utils/motion-variants/global-layout-motions'

type GlobalLayoutProps = {
  children?: ReactNode
  location?: Location
}

const dAppPages = new Set([
  '/approveConnection',
  '/suggestChain',
  '/sign',
  '/signSeiEvm',
  '/add-secret-token',
  '/login',
  '/suggest-erc-20',
  '/switch-ethereum-chain',
  '/switch-chain',
  '/suggest-ethereum-chain',
])

const showBottomNav = (path?: string) => {
  if (!path) {
    return false
  }

  if (path.includes('onboarding') || path === '/' || path.includes('forgotPassword')) {
    return false
  }

  return true
}

type CustomState = {
  from: { pathname: string; search?: string } | string
}

export const GlobalLayout = observer((props: PropsWithChildren<GlobalLayoutProps>) => {
  const auth = useAuth()

  const isFullScreen =
    window.innerWidth >= 450 && !sidePanel && !dAppPages.has(props.location?.pathname ?? '')

  const isOnboarding = props.location?.pathname.includes('onboarding')
  const isLogin = props.location?.pathname === '/'
  const { from: fromLogin } = (props.location?.state || {}) as CustomState

  const variants = isLogin || isOnboarding ? opacityVariants : slideVariants
  const isBottomNavVisible =
    auth?.locked === 'unlocked' &&
    props.location?.pathname &&
    showBottomNav(props.location.pathname) &&
    !!routeToLabelMap[props.location.pathname]

  return (
    <>
      <div
        className={cn(
          'enclosing-panel relative m-auto flex flex-col overflow-hidden',
          isOnboarding
            ? 'h-[38.875rem] w-[28rem] bg-secondary border border-secondary-200 rounded-3xl'
            : 'panel-width bg-secondary panel-height max-panel-height',
        )}
      >
        <AnimatePresence exitBeforeEnter presenceAffectsLayout initial={false}>
          <motion.div
            key={props.location?.pathname}
            id='popup-layout'
            className={'flex-1 panel-height overflow-auto flex flex-col'}
            transition={transition}
            variants={variants}
            initial={isLogin ? undefined : fromLogin ? 'opacity' : 'enter'}
            animate='animate'
            exit={'exit'}
          >
            <SideNav />
            <CopyAddressSheet />
            <ImportWatchWalletSeedPopup />

            {props.children}
          </motion.div>
        </AnimatePresence>

        {isBottomNavVisible && (
          <BottomNav label={routeToLabelMap[props?.location?.pathname ?? '']} />
        )}
      </div>

      {isFullScreen && (
        <div className='fixed top-6 left-8 right-8 flex flex-row justify-between items-center'>
          <CompassFullLogo className='h-6 z-10' />

          <Button variant={'ghost'} asChild className='gap-1.5 h-auto'>
            <a
              target='_blank'
              rel='noreferrer'
              href='https://leapwallet.notion.site/Compass-Wallet-Support-052adb5294a64eeb928036ee830ff11b'
            >
              <Question size={24} />
              Help
            </a>
          </Button>
        </div>
      )}
    </>
  )
})
