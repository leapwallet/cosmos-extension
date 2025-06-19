import { useActiveChain, useActiveWallet, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks'
import { useTabIndicatorPosition } from 'hooks/utility/useTabIndicatorPosition'
import Lottie from 'lottie-react'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from 'utils/cn'

import {
  allBottomNavItems,
  bottomNavItemsForWatchWallet,
  BottomNavLabel,
  routeToLabelMap,
} from './bottom-nav-items'

type BottomNavProps = {
  label: BottomNavLabel
  disableLottie?: boolean
}

const indicatorDefaultScale = {
  transform: 'translateX(12px) scaleX(0.14)',
}

const useShowBottomNav = () => {
  const location = useLocation()

  const isBottomNavVisible =
    location.pathname &&
    !!routeToLabelMap[location.pathname] &&
    !location.pathname.includes('onboarding') &&
    !location.pathname.includes('forgotPassword')

  return isBottomNavVisible
}

const BottomNavView = ({ label, disableLottie }: BottomNavProps) => {
  const activeWallet = useActiveWallet()
  const activeChain = useActiveChain()
  const featureFlags = useFeatureFlags()

  const bottomNavItems = activeWallet?.watchWallet
    ? bottomNavItemsForWatchWallet
    : allBottomNavItems

  const { containerRef, indicatorRef, childRefs } = useTabIndicatorPosition({
    navItems: bottomNavItems,
    activeLabel: label,
    widthScale: 0.7,
  })

  const isBottomNavVisible = useShowBottomNav()
  const [showLottie, setShowLottie] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      // to hide initial lottie animation on page load
      setShowLottie(true)
    }, 3000)
  }, [])

  if (!isBottomNavVisible) return null

  return (
    <div
      ref={containerRef}
      className={
        'flex absolute justify-around left-0 !h-[64px] right-0 bottom-0 w-full bg-secondary-50/75 backdrop-blur-xl border-t border-secondary-400/50 overflow-hidden mx-auto'
      }
    >
      {bottomNavItems.map(({ label: l, path, params, lottie, Icon }, idx) => {
        const isDisabled =
          l === BottomNavLabel.Swap &&
          (featureFlags?.data?.swaps?.extension === 'disabled' ||
            ['nomic', 'seiDevnet'].includes(activeChain))

        return (
          <Link
            key={`${l}_${idx}`}
            ref={(ref) => childRefs.current.set(idx, ref)}
            to={isDisabled ? '' : `${path}?${params || ''}`}
            className={cn(
              'flex flex-col gap-1 py-3 flex-1 justify-between items-center cursor-pointer relative disabled:cursor-not-allowed transition-colors duration-75 group',
              label === l ? 'text-primary' : 'text-muted-foreground hover:text-secondary-800 group',
              isDisabled && 'cursor-not-allowed opacity-50 hover:text-muted-foreground',
            )}
          >
            <LottieWrapper
              showLottie={showLottie}
              disableLottie={disableLottie}
              Icon={Icon}
              active={label === l}
              lottie={lottie}
            />

            <span className='text-[10px] leading-3 font-bold'>{l}</span>
          </Link>
        )
      })}

      <div
        ref={indicatorRef}
        style={indicatorDefaultScale}
        className='absolute top-0 origin-left scale-0 translate-x-3 transition-transform duration-200 w-full h-1 bg-primary rounded-[50vmin/10vmin]'
      />
    </div>
  )
}

BottomNavView.displayName = 'BottomNavView'
export const BottomNav = observer(BottomNavView)

const LottieWrapper = ({
  showLottie,
  disableLottie,
  Icon,
  active,
  lottie,
}: {
  showLottie: boolean
  disableLottie?: boolean
  lottie: { on: unknown; off: unknown }
  active: boolean
  Icon: (props: { className?: string }) => JSX.Element
}) => {
  return (
    <>
      {(!showLottie || disableLottie) && <Icon className='size-5' />}

      {!disableLottie && (
        <Lottie
          loop={false}
          animationData={active ? lottie.on : lottie.off}
          className={cn('size-5 [&_g_path]:fill-current ', !showLottie && 'sr-only')}
        />
      )}
    </>
  )
}
