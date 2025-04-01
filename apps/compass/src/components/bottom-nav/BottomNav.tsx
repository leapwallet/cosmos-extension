import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { useTabIndicatorPosition } from 'hooks/utility/useTabIndicatorPosition'
import Lottie from 'lottie-react'
import React, { memo, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from 'utils/cn'

import { allBottomNavItems, bottomNavItemsForWatchWallet, BottomNavLabel } from './bottom-nav-items'

type BottomNavProps = {
  label: BottomNavLabel
  disableLottie?: boolean
}

const indicatorDefaultScale = {
  transform: 'translateX(12px) scaleX(0.14)',
}

const BottomNav = ({ label, disableLottie }: BottomNavProps) => {
  const activeWallet = useActiveWallet()

  const bottomNavItems = activeWallet?.watchWallet
    ? bottomNavItemsForWatchWallet
    : allBottomNavItems

  const { containerRef, indicatorRef, childRefs } = useTabIndicatorPosition({
    navItems: bottomNavItems,
    activeLabel: label,
    widthScale: 0.7,
  })

  const [showLottie, setShowLottie] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      // to hide initial lottie animation on page load
      setShowLottie(true)
    }, 300)
  }, [])

  return (
    <div
      ref={containerRef}
      className={
        'flex absolute justify-around left-0 right-0 bottom-0 w-full bg-secondary/75 backdrop-blur-xl border-t border-secondary-400/50 overflow-hidden mx-auto'
      }
    >
      {bottomNavItems.map(({ label: l, path, params, lottie, Icon }, idx) => {
        return (
          <Link
            key={`${l}_${idx}`}
            ref={(ref) => childRefs.current.set(idx, ref)}
            to={`${path}?${params || ''}`}
            className={cn(
              'flex flex-col gap-1 py-3 flex-1 justify-between items-center cursor-pointer relative disabled:cursor-not-allowed transition-colors duration-75 group',
              label === l
                ? 'text-accent-blue-200'
                : 'text-muted-foreground hover:text-secondary-800 group',
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
        className='absolute top-0 origin-left scale-0 translate-x-3 transition-transform duration-200 w-full h-1 bg-accent-blue-200 rounded-[50vmin/10vmin]'
      />
    </div>
  )
}

BottomNav.displayName = 'BottomNav'
export default memo(BottomNav)

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
      {(!showLottie || disableLottie) && <Icon className='size-6' />}

      {!disableLottie && (
        <Lottie
          loop={false}
          animationData={active ? lottie.on : lottie.off}
          className={'size-6 group-hover:[&_g_path]:fill-current ' + (!showLottie ? 'sr-only' : '')}
        />
      )}
    </>
  )
}
