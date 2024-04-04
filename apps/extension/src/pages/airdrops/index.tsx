import { useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import PopupLayout from 'components/layout/popup-layout'
import { PageName } from 'config/analytics'
import { motion } from 'framer-motion'
import { usePageView } from 'hooks/analytics/usePageView'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import SideNav from 'pages/home/side-nav'
import React, { useState } from 'react'
import { Colors } from 'theme/colors'

import AirdropsHome from './AirdropsHome'
import { AboutAirdropsSheet } from './components/about-airdrops-sheet'
import AirdropHeader, { HeaderActionType } from './components/AirdropHeader'

export default function Airdrops() {
  usePageView(PageName.Airdrops)

  const chains = useGetChains()
  const activeChain = useActiveChain()
  const activeChainInfo = chains[activeChain]
  const themeColor = Colors.getChainColor(activeChain, activeChainInfo)

  const [showSideNav, setShowSideNav] = useState<boolean>(false)
  const [showAboutAirdrops, setshowAboutAirdrops] = useState<boolean>(false)

  return (
    <motion.div className='relative h-full w-full'>
      <PopupLayout
        header={
          <AirdropHeader
            action={{
              onClick: function noRefCheck() {
                setShowSideNav(true)
              },
              type: HeaderActionType.NAVIGATION,
              className:
                'w-[48px] h-[40px] px-3 bg-[#FFFFFF] dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full',
            }}
            onImgClick={() => setshowAboutAirdrops(true)}
            title={'Airdrops'}
            topColor={themeColor}
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
