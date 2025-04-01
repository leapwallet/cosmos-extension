import { TestnetAlertStrip } from 'components/alert-strip'
import { EmptyCard } from 'components/empty-card'
import PopupLayout from 'components/layout/popup-layout'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import Sort from 'icons/sort'
import { LeapCosmos } from 'images/logos'
import { observer } from 'mobx-react-lite'
import SelectChain from 'pages/home/SelectChain'
import React, { useState } from 'react'

import { DisplaySettingsModal } from './display-settings-modal'
import InvestViewContainer from './invest-view'
import type { DisplaySettings } from './types'

const EarnPage = observer(() => {
  usePageView(PageName.Earn)

  const [showChainSelector, setShowChainSelector] = useState(false)
  const [showDisplaySettings, setShowDisplaySettings] = useState(false)

  const { activeWallet } = useActiveWallet()
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    sortBy: 'tvl',
  })

  if (!activeWallet) {
    return (
      <div className='relative w-full overflow-clip panel-height'>
        <PopupLayout>
          <div>
            <EmptyCard src={LeapCosmos} heading='No wallet found' />
          </div>
        </PopupLayout>
      </div>
    )
  }

  return (
    <div className='relative w-full overflow-clip panel-height'>
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
              <Sort size={20} className='dark:text-white-100 text-gray-800' />
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
    </div>
  )
})

export default EarnPage
