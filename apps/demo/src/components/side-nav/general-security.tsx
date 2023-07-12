import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { Header, HeaderActionType, NavCard, ToggleCard } from '@leapwallet/leap-ui'
import React, { ReactElement, useState } from 'react'

import CardDivider from '~/components/card-divider'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import {
  useHideSmallBalances,
  useSetHideSmallBalances,
} from '~/hooks/settings/use-hide-small-balances'
import { Images } from '~/images'

import ConnectedSites from './connected-sites'
import { SideNavSection } from './elements'
import SetLockTimerDropUp from './set-lock-timer-drop-up'

export const GENERAL_SECURITY_PAGES = {
  DEFAULT: 0,
  CONNECTED_SITES: 1,
}

export default function GeneralSecurity({ goBack }: { goBack: () => void }): ReactElement {
  const [showLockTimeDropUp, setShowLockTimeDropUp] = useState(false)
  const [page, setPage] = useState(GENERAL_SECURITY_PAGES.DEFAULT)
  const balancesHidden = useHideSmallBalances()
  const setBalancesVisibility = useSetHideSmallBalances()
  const activeChain = useActiveChain()

  if (page === GENERAL_SECURITY_PAGES.CONNECTED_SITES) {
    return <ConnectedSites setPage={setPage} />
  }

  return (
    <div className='h-[600px]'>
      <Header
        topColor={ChainInfos[activeChain].theme.primaryColor}
        title='General Security'
        action={{ type: HeaderActionType.BACK, onClick: goBack }}
      />
      <div className='flex flex-col items-center p-[28px]'>
        <SideNavSection>
          <div className='py-2 bg-white-100 dark:bg-gray-900' />
          <ToggleCard
            imgSrc={Images.Misc.VisibilityOff}
            isEnabled={balancesHidden}
            isRounded={false}
            size='sm'
            onClick={() => {
              setBalancesVisibility(!balancesHidden)
            }}
            title='Hide Assets'
            subTitle='Balances will be hidden upon loading wallet'
          />
          <CardDivider />
          <NavCard
            imgSrc={Images.Misc.Timer}
            property={'Auto-lock timer'}
            value={'15 min'}
            onClick={() => {
              setShowLockTimeDropUp(true)
            }}
          />
          <NavCard
            imgSrc={Images.Misc.Globe}
            property={'Connected Sites'}
            onClick={() => {
              setPage(GENERAL_SECURITY_PAGES.CONNECTED_SITES)
            }}
          />
        </SideNavSection>
      </div>
      <SetLockTimerDropUp
        isVisible={showLockTimeDropUp}
        onCloseHandler={() => setShowLockTimeDropUp(false)}
      />
    </div>
  )
}
