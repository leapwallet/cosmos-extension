import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import { TestnetAlertStrip } from 'components/alert-strip'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { EmptyCard } from 'components/empty-card'
import PopupLayout from 'components/layout/popup-layout'
import { PageName } from 'config/analytics'
import { useChainPageInfo } from 'hooks'
import { usePageView } from 'hooks/analytics/usePageView'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { LeapCosmos } from 'images/logos'
import SelectChain from 'pages/home/SelectChain'
import SideNav from 'pages/home/side-nav'
import React, { useState } from 'react'

import { DisplaySettingsModal } from './display-settings-modal'
import InvestViewContainer from './invest-view'
import type { DisplaySettings } from './types'

export default function EarnPage() {
  usePageView(PageName.Earn)

  const [showSideNav, setShowSideNav] = useState(false)
  const [showChainSelector, setShowChainSelector] = useState(false)
  const [showDisplaySettings, setShowDisplaySettings] = useState(false)

  const { activeWallet } = useActiveWallet()
  const { headerChainImgSrc } = useChainPageInfo()
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    sortBy: 'tvl',
  })

  if (!activeWallet) {
    return (
      <div className='relative w-[400px] overflow-clip'>
        <PopupLayout>
          <div>
            <EmptyCard src={LeapCosmos} heading='No wallet found' />
          </div>
        </PopupLayout>
      </div>
    )
  }

  return (
    <div className='relative w-[400px] overflow-clip'>
      <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
      <PopupLayout
        header={
          <Header
            action={{
              onClick: function noRefCheck() {
                setShowSideNav(true)
              },
              type: HeaderActionType.NAVIGATION,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              className:
                'w-[48px] h-[40px] px-3 bg-[#FFFFFF] dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full',
            }}
            imgSrc={headerChainImgSrc}
            onImgClick={() => setShowChainSelector(true)}
            title='Earn'
          />
        }
      >
        <TestnetAlertStrip />

        <div className='w-full px-7 pt-7 mb-[84px]'>
          <div className='mb-5'>
            <div className='flex justify-between items-baseline'>
              <div>
                <h2 className='text-[28px] text-black-100 dark:text-white-100 font-bold w-[194px]'>
                  Earn
                </h2>
                <h3 className='text-sm text-gray-600 font-bold'>
                  Invest your crypto and earn rewards
                </h3>
              </div>
              <button
                className='flex items-center justify-center h-9 w-9 bg-white-100 dark:bg-gray-900 rounded-full ml-3'
                onClick={() => setShowDisplaySettings(true)}
              >
                <span className='material-icons-round dark:text-white-100 text-gray-800'>sort</span>
              </button>
            </div>
          </div>
          <InvestViewContainer displaySettings={displaySettings} />
        </div>
        <DisplaySettingsModal
          isOpen={showDisplaySettings}
          onClose={() => setShowDisplaySettings(false)}
          settings={displaySettings}
          onSettingsChange={setDisplaySettings}
        />
      </PopupLayout>
      <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
      <BottomNav label={BottomNavLabel.Earn} />
    </div>
  )
}
