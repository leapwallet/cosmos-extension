import { Info } from '@phosphor-icons/react'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { PageHeader } from 'components/header'
import PopupLayout from 'components/layout/popup-layout'
import { PageName } from 'config/analytics'
import { motion } from 'framer-motion'
import { usePageView } from 'hooks/analytics/usePageView'
import SideNav from 'pages/home/side-nav'
import React, { useCallback, useState } from 'react'
import { HeaderActionType } from 'types/components'

import AirdropsHome from './AirdropsHome'
import { AboutAirdropsSheet } from './components/about-airdrops-sheet'

export default function Airdrops() {
  usePageView(PageName.Airdrops)
  const [showSideNav, setShowSideNav] = useState<boolean>(false)
  const [showAboutAirdrops, setshowAboutAirdrops] = useState<boolean>(false)

  const handleShowAboutAirdropsSheet = useCallback(() => setshowAboutAirdrops(true), [])
  const handleOpenSideNavSheet = useCallback(() => setShowSideNav(true), [])

  return (
    <motion.div className='relative h-full w-full enclosing-panel'>
      <PopupLayout
        header={
          <PageHeader
            title='Airdrops'
            imgSrc={<Info size={20} className='text-black-100 dark:text-white-100' />}
            onImgClick={handleShowAboutAirdropsSheet}
            action={{
              onClick: handleOpenSideNavSheet,
              type: HeaderActionType.NAVIGATION,
              className: 'min-w-[48px] h-[36px] px-2 bg-[#FFFFFF] dark:bg-gray-950 rounded-full',
            }}
            dontShowFilledArrowIcon={true}
          />
        }
      >
        <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
        <div className='p-7 overflow-y-auto' style={{ height: 'calc(100% - 72px - 60px)' }}>
          <AirdropsHome />
        </div>
      </PopupLayout>
      <BottomNav label={BottomNavLabel.Airdrops} />
      <AboutAirdropsSheet isOpen={showAboutAirdrops} onClose={() => setshowAboutAirdrops(false)} />
    </motion.div>
  )
}
