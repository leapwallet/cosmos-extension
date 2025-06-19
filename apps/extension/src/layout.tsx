import { Question } from '@phosphor-icons/react'
import { routeToLabelMap } from 'components/bottom-nav/bottom-nav-items'
import { BottomNav } from 'components/bottom-nav/v2'
import { Button } from 'components/ui/button'
import { useAuth } from 'context/auth-context'
import { AnimatePresence, motion } from 'framer-motion'
import { LeapLogoFullSm } from 'icons/leap-logo'
import { observer } from 'mobx-react-lite'
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

type CustomState = {
  from: { pathname: string; search?: string } | string
}

export const v2LayoutPages = new Set([
  '/onboarding',
  '/onboardingCreate',
  '/onboardingImport',
  '/onboardingSuccess',
  '/importLedger',
  '/swap',
  '/home',
  '/',
  '/nfts',
  '/alpha',
  '/activity',
  '/assetDetails',
  '/send',
  '/stake',
  '/stake/input',
  '/airdrops',
  '/alpha',
  '/earn-usdn',
  '/initia-vip',
  '/buy',
  '/airdrops',
  '/airdropsDetails',
  '/gov',
  '/forgotPassword',
])

// TODO: Remove the location check once home layout is implemented
export const GlobalLayout = (props: PropsWithChildren<GlobalLayoutProps>) => {
  if (v2LayoutPages.has(props.location?.pathname ?? '')) {
    return <GlobalLayoutView {...props} />
  }

  return props.children as JSX.Element
}

const GlobalLayoutView = observer((props: PropsWithChildren<GlobalLayoutProps>) => {
  const isOnboarding =
    props.location?.pathname.includes('onboarding') ||
    props.location?.pathname.includes('importLedger')
  const isLogin = props.location?.pathname === '/'
  const auth = useAuth()

  const { from: fromLogin } = (props.location?.state || {}) as CustomState
  const variants = isLogin || isOnboarding ? opacityVariants : slideVariants

  const isFullScreen =
    window.innerWidth >= 450 && !sidePanel && !dAppPages.has(props.location?.pathname ?? '')

  return (
    <>
      {isFullScreen && <LayoutHeader />}

      <div
        className={cn(
          'enclosing-panel relative m-auto flex flex-col overflow-hidden',
          isOnboarding
            ? 'h-[38.875rem] w-[28rem] bg-secondary border border-secondary-200 rounded-3xl'
            : 'panel-width bg-secondary panel-height max-panel-height',
        )}
      >
        <AnimatePresence mode='wait' presenceAffectsLayout initial={false}>
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
            {props.children}
          </motion.div>
        </AnimatePresence>

        {auth?.locked === 'unlocked' && (
          <BottomNav label={routeToLabelMap[props?.location?.pathname ?? '']} />
        )}
      </div>
    </>
  )
})

export const LayoutHeader = () => {
  return (
    <div className='fixed top-6 left-8 right-8 flex flex-row justify-between items-center'>
      <LeapLogoFullSm />

      <Button variant={'ghost'} asChild className='gap-1.5 h-auto'>
        <a
          target='_blank'
          rel='noreferrer'
          href='https://leapwallet.notion.site/Leap-Wallet-Help-Center-Cosmos-ba1da3c05d3341eaa44a1850ed3260ee'
        >
          <Question size={24} />
          Help
        </a>
      </Button>
    </div>
  )
}
