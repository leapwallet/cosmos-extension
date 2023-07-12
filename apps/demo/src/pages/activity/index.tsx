import { Activity } from '@leapwallet/cosmos-wallet-hooks'
import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import React, { useState } from 'react'

import BottomNav, { BottomNavLabel } from '~/components/bottom-nav'
import PopupLayout from '~/components/popup-layout'
import SelectChain from '~/components/select-chain'
import SideNav from '~/components/side-nav'
import { useWalletActivity } from '~/hooks/activity/use-activity'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { ChainLogos } from '~/images/logos'

import { ActivityList } from './widgets/activity-list'
import TxDetails from './widgets/tx-details'

function Activity() {
  const [showSideNav, setShowSideNav] = useState(false)
  const [showChainSelector, setShowChainSelector] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity>()

  const activeChain = useActiveChain()
  const activity = useWalletActivity()

  return (
    <div className='relative w-full overflow-clip'>
      {selectedActivity ? (
        <TxDetails
          content={selectedActivity.content}
          parsedTx={selectedActivity.parsedTx}
          onBack={() => setSelectedActivity(undefined)}
        />
      ) : (
        <>
          <PopupLayout
            showBetaTag
            header={
              <Header
                action={{
                  onClick: function noRefCheck() {
                    setShowSideNav(true)
                  },
                  type: HeaderActionType.NAVIGATION,
                }}
                imgSrc={ChainLogos[activeChain]}
                onImgClick={function noRefCheck() {
                  setShowChainSelector(true)
                }}
                title={'Activity'}
                topColor={ChainInfos[activeChain].theme.primaryColor}
              />
            }
          >
            <SideNav isShown={showSideNav} toggler={() => setShowSideNav(!showSideNav)} />
            <div className='w-full flex flex-col justify-center pt-[28px] items-center mb-20 px-7'>
              <ActivityList setSelectedActivity={setSelectedActivity} activity={activity} />
            </div>
          </PopupLayout>
          <SelectChain isVisible={showChainSelector} onClose={() => setShowChainSelector(false)} />
          <BottomNav label={BottomNavLabel.Activity} />
        </>
      )}
    </div>
  )
}

export default Activity
