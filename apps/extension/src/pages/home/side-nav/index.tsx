import { X } from '@phosphor-icons/react'
import { Button } from 'components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader } from 'components/ui/drawer'
import { ExternalLinkIcon } from 'icons/external-link'
import { HappyFrog } from 'icons/frog'
import { observer } from 'mobx-react-lite'
import React, { ReactElement, ReactNode, useCallback, useEffect, useState } from 'react'
import { globalSheetsStore } from 'stores/global-sheets-store'
import { cn } from 'utils/cn'
import { isSidePanel } from 'utils/isSidePanel'
import browser from 'webextension-polyfill'

import { Features } from './Features'
import GeneralSecurity from './GeneralSecurity'
import LightNodePage from './LightNode'
import { NavItem } from './NavItem'
import NetworkDropUp from './Network'
import { Preferences } from './Preferences'
import { Resources } from './Resources'
import { Security } from './Security'
import SyncWithMobile from './SyncWithMobile'
import { NavPages } from './types'
import VersionIndicator from './VersionIndicator'

export type SideNavProps = {
  readonly defaults?: {
    openLightNodePage: boolean
  }
}

export const SideNavSection = observer(
  ({ children, className }: { children: ReactNode; className?: string }) => {
    return (
      <section
        className={cn(
          'bg-secondary-100 overflow-hidden rounded-xl flex flex-col justify-start items-start mt-5 first:mt-0',
          className,
        )}
      >
        {children}
      </section>
    )
  },
)

const SideNav = observer((): ReactElement => {
  const isShown = globalSheetsStore.isSideNavOpen

  const [showNavPage, setShowNavPage] = useState<NavPages | undefined>()

  const isInExpandView = browser.extension.getViews({ type: 'tab' }).length > 0

  const handleExpandView = useCallback(() => {
    const views = browser.extension.getViews({ type: 'popup' })
    if (views.length === 0) {
      globalSheetsStore.toggleSideNav()
    } else {
      window.open(browser.runtime.getURL('index.html'))
    }
  }, [])

  useEffect(() => {
    if (globalSheetsStore.sideNavDefaults?.openLightNodePage) {
      setShowNavPage(NavPages.LightNode)
    }
    if (globalSheetsStore.sideNavDefaults?.openTokenDisplayPage) {
      setShowNavPage(NavPages.Preferences)
    }
  }, [globalSheetsStore.sideNavDefaults])

  return (
    <Drawer
      direction='left'
      open={isShown}
      onOpenChange={(open) => !open && globalSheetsStore.toggleSideNav()}
    >
      <DrawerContent
        showHandle={false}
        className={
          'panel-width panel-height overflow-clip overflow-y-auto rounded-none bg-secondary-50 isolate'
        }
      >
        <DrawerHeader className='flex items-center justify-between border-b border-border-bottom/50 px-6 py-4'>
          <div className='flex items-center gap-2'>
            <HappyFrog className='size-8' />
            <h3 className='text-mdl font-bold'>Leap Wallet</h3>
          </div>

          <DrawerClose asChild>
            <Button variant={'ghost'} size={'icon'} className='size-12'>
              <X weight='bold' size={18} />
              <span className='sr-only'>close</span>
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className='py-7 px-6 overflow-scroll'>
          {isInExpandView || isSidePanel() ? null : (
            <SideNavSection>
              <NavItem label='Expand View' icon={<ExternalLinkIcon />} onClick={handleExpandView} />
            </SideNavSection>
          )}

          <Features setShowNavPage={setShowNavPage} />

          <Security setShowNavPage={setShowNavPage} />

          <Resources />

          <VersionIndicator />
        </div>

        <GeneralSecurity
          isVisible={showNavPage === NavPages.Security}
          goBack={() => setShowNavPage(undefined)}
        />

        <NetworkDropUp
          isVisible={showNavPage === NavPages.Network}
          goBack={() => setShowNavPage(undefined)}
        />

        <Preferences
          isVisible={showNavPage === NavPages.Preferences}
          goBack={() => setShowNavPage(undefined)}
        />

        <LightNodePage
          isVisible={showNavPage === NavPages.LightNode}
          goBack={(toHome?: boolean) => {
            setShowNavPage(undefined)
            if (toHome) {
              globalSheetsStore.toggleSideNav()
            }
          }}
        />

        <SyncWithMobile
          open={showNavPage === NavPages.SyncWithMobile}
          goBack={() => setShowNavPage(undefined)}
        />
      </DrawerContent>
    </Drawer>
  )
})
export default SideNav
