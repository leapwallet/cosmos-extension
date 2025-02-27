import { NavCard, SideNavHeader, ThemeName, useTheme } from '@leapwallet/leap-ui'
import classnames from 'classnames'
import { AlertStrip } from 'components/alert-strip'
import { useChainPageInfo } from 'hooks'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { ReactElement, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { chainTagsStore } from 'stores/chain-infos-store'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
import browser from 'webextension-polyfill'

import ChangeCurrency from './ChangeCurrency'
import { CustomEndpoints } from './CustomEndpoints'
import ExportPrivateKey from './ExportPrivateKey'
import ExportSeedPhrase from './ExportSeedPhrase'
import { Footer } from './Footer'
import GeneralSecurity from './GeneralSecurity'
import LightNode from './LightNode/LightNode'
import NetworkDropUp from './Network'
import { Preferences } from './Preferences'
import { Resources } from './Resources'
import { Security } from './Security'
import SyncWithMobile from './SyncWithMobile'
import ThemeDropUp from './Theme'
import { TokenDisplay } from './TokenDisplay'

type InitialFaucetResp = {
  msg: string
  status: 'success' | 'fail' | null
}

const initialFaucetResp: InitialFaucetResp = {
  msg: '',
  status: null,
}

export type SideNavProps = {
  readonly isShown: boolean
  readonly toggler?: () => void
  readonly defaults?: {
    openLightNodePage: boolean
  }
}

export enum NavPages {
  // eslint-disable-next-line no-unused-vars
  ExportSeedPhrase,
  // eslint-disable-next-line no-unused-vars
  ExportPrivateKey,
  // eslint-disable-next-line no-unused-vars
  SyncWithMobile,
  // eslint-disable-next-line no-unused-vars
  SelectCurrency,
  // eslint-disable-next-line no-unused-vars
  SelectTheme,
  // eslint-disable-next-line no-unused-vars
  SelectNetwork,
  // eslint-disable-next-line no-unused-vars
  ChangeEndpoints,
  // eslint-disable-next-line no-unused-vars
  ManageAuthz,
  // eslint-disable-next-line no-unused-vars
  LightNode,
  // eslint-disable-next-line no-unused-vars
  TokenDisplay,
}

export function SideNavSectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className='w-full h-10 px-4 pb-1 pt-5 font-bold text-xs bg-white-100 dark:bg-gray-900 dark:text-white-100'>
      {children}
    </div>
  )
}

export const SideNavSection = observer(
  ({ children, className }: { children: ReactNode; className?: string }) => {
    return (
      <div className={classnames('overflow-hidden rounded-2xl mt-4', className)}>{children}</div>
    )
  },
)

export function OverflowSideNavSection({ children }: { children: ReactNode }) {
  return <div className='rounded-2xl mt-4 min-h-fit'>{children}</div>
}

const SideNav = observer(({ isShown, toggler, defaults }: SideNavProps): ReactElement => {
  const [showGSDropUp, setShowGSDropUp] = useState(false)
  const [showNetworkDropUp, setShowNetworkDropUp] = useState(false)
  const [showFaucetResp, setShowFaucetResp] = useState<InitialFaucetResp>(initialFaucetResp)
  const [showThemeDropUp, setShowThemeDropUp] = useState(false)
  const [showNavPage, setShowNavPage] = useState<NavPages | undefined>()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { theme } = useTheme()
  const isDark = theme === ThemeName.DARK
  const isInExpandView = browser.extension.getViews({ type: 'tab' }).length > 0
  const { topChainColor } = useChainPageInfo()

  const getPage = useCallback(() => {
    switch (showNavPage) {
      case NavPages.ExportSeedPhrase:
        return <ExportSeedPhrase goBack={() => setShowNavPage(undefined)} />
      case NavPages.ExportPrivateKey:
        return <ExportPrivateKey goBack={() => setShowNavPage(undefined)} />
      case NavPages.SyncWithMobile:
        return <SyncWithMobile goBack={() => setShowNavPage(undefined)} />
      case NavPages.SelectCurrency:
        return (
          <div className='overflow-y-scroll min-h-screen max-h-fit'>
            <ChangeCurrency
              goBack={() => {
                setShowNavPage(undefined)
              }}
            />
          </div>
        )
      case NavPages.ChangeEndpoints:
        return (
          <CustomEndpoints
            goBack={() => setShowNavPage(undefined)}
            chainTagsStore={chainTagsStore}
          />
        )
      case NavPages.LightNode:
        return (
          <LightNode
            goBack={(toHome?: boolean) => {
              setShowNavPage(undefined)
              if (toHome) {
                toggler?.()
              }
            }}
          />
        )
      case NavPages.TokenDisplay:
        return <TokenDisplay goBack={() => setShowNavPage(undefined)} />
    }
  }, [showNavPage, toggler])

  const handleExpandView = useCallback(() => {
    const views = browser.extension.getViews({ type: 'popup' })
    if (views.length === 0 && toggler) {
      toggler()
    } else {
      window.open(browser.runtime.getURL('index.html'))
    }
  }, [toggler])

  const handleCloseGSDropUp = useCallback(() => {
    setShowGSDropUp(false)
  }, [])

  useEffect(() => {
    if (isShown) {
      const sideNavParent = containerRef.current?.parentElement
      let previousScrollTop = 0
      if (sideNavParent) {
        previousScrollTop = sideNavParent.scrollTop
        sideNavParent.style.overflow = 'hidden'
        containerRef.current?.scrollIntoView()
      }
      return () => {
        if (sideNavParent && previousScrollTop > 0) {
          sideNavParent.scrollTo(0, previousScrollTop)
          sideNavParent.style.overflow = 'auto'
        }
      }
    }
  }, [isShown])

  useEffect(() => {
    if (defaults?.openLightNodePage) {
      setShowNavPage(NavPages.LightNode)
    }
  }, [defaults])

  return (
    <div
      data-testing-id='side-nav'
      ref={containerRef}
      className={classnames(
        'absolute left-0 top-0 enclosing-panel panel-width panel-height overflow-clip overflow-y-auto rounded-[10px] z-[1000] transition-transform ease-in-out duration-500 dark:bg-black-100 bg-gray-50',
        {
          '-translate-x-[400px] ': !isShown,
          'translate-x-0': isShown,
          'overflow-hidden': showNetworkDropUp || showThemeDropUp,
        },
      )}
    >
      {showGSDropUp && (
        <GeneralSecurity goBack={handleCloseGSDropUp} chainTagsStore={chainTagsStore} />
      )}
      {showNavPage !== undefined && getPage()}
      {showFaucetResp.msg && (
        <div className='text-center'>
          <AlertStrip
            message={showFaucetResp.msg}
            bgColor={showFaucetResp.status === 'success' ? Colors.green600 : Colors.red300}
            alwaysShow={false}
            onHide={() => {
              setShowFaucetResp(initialFaucetResp)
            }}
            className='absolute bottom-[80px] right-7 left-7 rounded-xl w-80 h-auto p-2 z-50'
            timeOut={6000}
          />
        </div>
      )}
      {showNavPage === undefined && !showGSDropUp && (
        <div className='flex flex-col h-full enclosing-panel'>
          <div className='fixed dark:bg-black-100 bg-gray-50'>
            <div className='w-full h-1' style={{ backgroundColor: topChainColor }} />
            <SideNavHeader
              brandName={isCompassWallet() ? 'COMPASS' : ''}
              brandImage={
                isCompassWallet() ? (
                  <img src={Images.Logos.CompassCircle} />
                ) : (
                  <img
                    src={isDark ? Images.Logos.LeapDarkMode : Images.Logos.LeapLightMode}
                    className={'h-[30px]'}
                  />
                )
              }
              onBackClick={toggler}
            />
          </div>
          <div className='p-7 mt-[72px] overflow-scroll'>
            {isInExpandView || isSidePanel() ? null : (
              <NavCard
                property='Expand View'
                isRounded
                imgSrc={Images.Nav.ExportIcon}
                onClick={handleExpandView}
              />
            )}
            <Preferences
              setShowNavPage={setShowNavPage}
              containerRef={containerRef}
              setShowNetworkDropUp={setShowNetworkDropUp}
              setShowThemeDropUp={setShowThemeDropUp}
            />

            <Security setShowNavPage={setShowNavPage} setShowGSDropUp={setShowGSDropUp} />

            <Resources />

            <Footer />
          </div>
        </div>
      )}
      <NetworkDropUp
        isVisible={showNetworkDropUp}
        onCloseHandler={() => setShowNetworkDropUp(false)}
      />
      {/* {showFinderDropUp && <FinderDropUp onCloseHandler={() => setShowFinderDropUp(false)} />} */}

      <ThemeDropUp isVisible={showThemeDropUp} onCloseHandler={() => setShowThemeDropUp(false)} />
    </div>
  )
})
export default SideNav
