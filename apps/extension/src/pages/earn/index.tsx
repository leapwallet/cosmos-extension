import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { EmptyCard } from 'components/empty-card'
import PopupLayout from 'components/layout/popup-layout'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useChainInfos } from 'hooks/useChainInfos'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { useThemeColor } from 'hooks/utility/useThemeColor'
import { LeapCosmos } from 'images/logos'
import SelectChain from 'pages/home/SelectChain'
import SideNav from 'pages/home/side-nav'
import React, { useState } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

import { DisplaySettingsModal } from './display-settings-modal'
import InvestViewContainer from './invest-view'
import type { DisplaySettings } from './types'

export default function EarnPage() {
  const [showSideNav, setShowSideNav] = useState(false)
  const [showDisplaySettings, setShowDisplaySettings] = useState(false)
  const [showChainSelector, setShowChainSelector] = useState(false)

  const defaultTokenLogo = useDefaultTokenLogo()
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    sortBy: 'tvl',
  })

  const themeColor = useThemeColor()
  const { activeWallet } = useActiveWallet()
  const activeChain = useActiveChain()
  const chainInfos = useChainInfos()
  const activeChainInfo = chainInfos[activeChain]

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
              onClick: () => setShowSideNav(true),
              type: HeaderActionType.NAVIGATION,
            }}
            title='Earn'
            imgSrc={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
            onImgClick={
              isCompassWallet()
                ? undefined
                : function noRefCheck() {
                    setShowChainSelector(true)
                  }
            }
            topColor={themeColor}
          />
        }
      >
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
        <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
      </PopupLayout>
      <BottomNav label={BottomNavLabel.Earn} />
    </div>
  )
}
