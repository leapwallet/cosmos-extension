import { NavCard, SideNavHeader, ThemeName, useTheme } from '@leapwallet/leap-ui'
import classnames from 'classnames'
import { AlertStrip } from 'components/alert-strip'
import { Drawer, DrawerContent } from 'components/ui/drawer'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { globalSheetsStore } from 'stores/ui/global-sheets-store'
import { Colors } from 'theme/colors'
import { cn } from 'utils/cn'
import { isSidePanel } from 'utils/isSidePanel'
import browser from 'webextension-polyfill'

import ChangeCurrency from './ChangeCurrency'
import { CustomEndpoints } from './CustomEndpoints'
import ExportPrivateKey from './ExportPrivateKey'
import ExportSeedPhrase from './ExportSeedPhrase'
import { Footer } from './Footer'
import GeneralSecurity from './GeneralSecurity'
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

export enum NavPages {
  ExportSeedPhrase = 'ExportSeedPhrase',
  ExportPrivateKey = 'ExportPrivateKey',
  SyncWithMobile = 'SyncWithMobile',
  SelectCurrency = 'SelectCurrency',
  SelectTheme = 'SelectTheme',
  SelectNetwork = 'SelectNetwork',
  ChangeEndpoints = 'ChangeEndpoints',
  ManageAuthz = 'ManageAuthz',
  TokenDisplay = 'TokenDisplay',
}

export enum DropUps {
  GS = 'gs',
  NETWORK = 'network',
  THEME = 'theme',
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

const SideNav = observer(() => {
  const [showFaucetResp, setShowFaucetResp] = useState<InitialFaucetResp>(initialFaucetResp)

  const [dropUp, setDropUp] = useState<DropUps>()
  const [showNavPage, setShowNavPage] = useState<NavPages>()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const isInExpandView = browser.extension.getViews({ type: 'tab' }).length > 0

  useEffect(() => {
    if (globalSheetsStore.isSideNavOpen) {
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

    if (!globalSheetsStore.isSideNavOpen) {
      setDropUp(undefined)
      setShowNavPage(undefined)
    }
  }, [globalSheetsStore.isSideNavOpen])

  return (
    <Drawer
      direction='left'
      open={globalSheetsStore.isSideNavOpen}
      onOpenChange={() => globalSheetsStore.toggleSideNav()}
    >
      <DrawerContent
        data-testing-id='side-nav'
        showHandle={false}
        ref={containerRef}
        className={cn('panel-width panel-height bg-secondary overflow-auto rounded-none')}
      >
        {dropUp === DropUps.GS && <GeneralSecurity goBack={() => setDropUp(undefined)} />}

        {!!showNavPage && <SideNavPage showNavPage={showNavPage} setShowNavPage={setShowNavPage} />}

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

        {!showNavPage && dropUp !== DropUps.GS && (
          <div className='flex flex-col [&>*]:shrink-0 h-full'>
            <SideNavHeader
              brandName={'COMPASS'}
              brandImage={<img src={Images.Logos.CompassCircle} />}
              onBackClick={() => globalSheetsStore.toggleSideNav()}
            />

            <div className='p-7 pt-2 overflow-scroll'>
              {isInExpandView || isSidePanel() ? null : (
                <NavCard
                  property='Expand View'
                  isRounded
                  imgSrc={Images.Nav.ExportIcon}
                  onClick={() => globalSheetsStore.expandView()}
                />
              )}
              <Preferences
                setShowNavPage={setShowNavPage}
                containerRef={containerRef}
                openNetworkDropUp={() => setDropUp(DropUps.NETWORK)}
                openThemeDropUp={() => setDropUp(DropUps.THEME)}
              />

              <Security
                setShowNavPage={setShowNavPage}
                openGSDropUp={() => setDropUp(DropUps.GS)}
              />

              <Resources />

              <Footer />
            </div>
          </div>
        )}
        <NetworkDropUp
          isVisible={dropUp === DropUps.NETWORK}
          onCloseHandler={() => setDropUp(undefined)}
        />
        {/* {showFinderDropUp && <FinderDropUp onCloseHandler={() => setShowFinderDropUp(false)} />} */}

        <ThemeDropUp
          isVisible={dropUp === DropUps.THEME}
          onCloseHandler={() => setDropUp(undefined)}
        />
      </DrawerContent>
    </Drawer>
  )
})

export default SideNav

const SideNavPage = ({
  showNavPage,
  setShowNavPage,
}: {
  showNavPage: NavPages
  setShowNavPage: (page?: NavPages) => void
}) => {
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
      return <CustomEndpoints goBack={() => setShowNavPage(undefined)} />

    case NavPages.TokenDisplay:
      return <TokenDisplay goBack={() => setShowNavPage(undefined)} />
  }

  return null
}
