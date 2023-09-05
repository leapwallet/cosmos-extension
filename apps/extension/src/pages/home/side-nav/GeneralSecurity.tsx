import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, Header, HeaderActionType, NavCard, ToggleCard } from '@leapwallet/leap-ui'
import { useHideAssets, useSetHideAssets } from 'hooks/settings/useHideAssets'
import { TimerLockPeriodRev, useLockTimer } from 'hooks/settings/usePassword'
import { Images } from 'images'
import React, { ReactElement, useState } from 'react'
import { Colors } from 'theme/colors'

import { SideNavSection } from '.'
import ConnectedSites from './ConnectedSites'
import SetLockTimerDropUp from './SetLockTimer'

export const GENERAL_SECURITY_PAGES = {
  DEFAULT: 0,
  CONNECTED_SITES: 1,
}

export default function GeneralSecurity({ goBack }: { goBack: () => void }): ReactElement {
  const activeChain = useActiveChain()
  const [showLockTimeDropUp, setShowLockTimeDropUp] = useState(false)
  const [page, setPage] = useState(GENERAL_SECURITY_PAGES.DEFAULT)
  const { lockTime } = useLockTimer()
  const { hideBalances: balancesHidden } = useHideAssets()
  const setBalancesVisibility = useSetHideAssets()

  if (page === GENERAL_SECURITY_PAGES.CONNECTED_SITES) {
    return <ConnectedSites setPage={setPage} />
  }

  return (
    <div className='h-[600px]'>
      <Header
        topColor={Colors.getChainColor(activeChain)}
        title='General Security'
        action={{ type: HeaderActionType.BACK, onClick: goBack }}
      />
      <div className='flex flex-col items-center p-[28px]'>
        <SideNavSection>
          <div className='pt-3 pb-1 bg-white-100 dark:bg-gray-900'>
            <ToggleCard
              imgSrc={Images.Misc.VisibilityOff}
              isEnabled={balancesHidden}
              isRounded={false}
              size='sm'
              title='Hide Assets'
              subtitle='Balances will be hidden upon loading wallet'
              onClick={() => {
                setBalancesVisibility(!balancesHidden)
              }}
            />
          </div>
          <CardDivider />
          <div className='py-1 bg-white-100 dark:bg-gray-900'>
            <NavCard
              imgSrc={Images.Misc.Timer}
              property='Auto-lock timer'
              value={TimerLockPeriodRev[lockTime]}
              onClick={() => {
                setShowLockTimeDropUp(true)
              }}
            />
          </div>
          <CardDivider />
          <div className='py-1 bg-white-100 dark:bg-gray-900'>
            <NavCard
              imgSrc={Images.Misc.Globe}
              property='Connected Sites'
              onClick={() => {
                setPage(GENERAL_SECURITY_PAGES.CONNECTED_SITES)
              }}
            />
          </div>
        </SideNavSection>
      </div>
      <SetLockTimerDropUp
        isVisible={showLockTimeDropUp}
        onCloseHandler={() => setShowLockTimeDropUp(false)}
      />
    </div>
  )
}
