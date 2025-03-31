import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, Header, HeaderActionType, NavCard, ToggleCard } from '@leapwallet/leap-ui'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { ReactElement, useMemo, useState } from 'react'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { autoLockTimeStore, TimerLockPeriodRev } from 'stores/password-store'
import { AggregatedSupportedChain } from 'types/utility'

import { SideNavSection } from '.'
import ConnectedSites from './ConnectedSites'
import { ManageAuthZ } from './ManageAuthZ'
import SetLockTimerDropUp from './SetLockTimer'

export const GENERAL_SECURITY_PAGES = {
  DEFAULT: 0,
  CONNECTED_SITES: 1,
  MANAGE_AUTHZ: 2,
}

const GeneralSecurity = observer(({ goBack }: { goBack: () => void }): ReactElement => {
  const activeChain = useActiveChain()
  const [showLockTimeDropUp, setShowLockTimeDropUp] = useState(false)
  const [page, setPage] = useState(GENERAL_SECURITY_PAGES.DEFAULT)

  const NavOptions = useMemo(
    () => [
      {
        imgSrc: Images.Misc.Timer,
        property: 'Auto-lock timer',
        value: TimerLockPeriodRev[autoLockTimeStore.time],
        onClick: () => {
          setShowLockTimeDropUp(true)
        },
        disabled: false,
      },
      {
        imgSrc: Images.Misc.Globe,
        property: 'Connected Sites',
        value: '',
        onClick: () => {
          setPage(GENERAL_SECURITY_PAGES.CONNECTED_SITES)
        },
        disabled: (activeChain as AggregatedSupportedChain) === AGGREGATED_CHAIN_KEY,
      },

      {
        imgSrc: Images.Nav.ManageAuthZ,
        property: 'Manage AuthZ',
        value: '',
        onClick: () => {
          setPage(GENERAL_SECURITY_PAGES.MANAGE_AUTHZ)
        },
        disabled: false,
      },
    ],
    [activeChain],
  )

  if (page === GENERAL_SECURITY_PAGES.CONNECTED_SITES) {
    return <ConnectedSites setPage={setPage} />
  }

  if (page === GENERAL_SECURITY_PAGES.MANAGE_AUTHZ) {
    return <ManageAuthZ goBack={() => setPage(GENERAL_SECURITY_PAGES.DEFAULT)} />
  }

  return (
    <div className='panel-height enclosing-panel'>
      <Header title='Security' action={{ type: HeaderActionType.BACK, onClick: goBack }} />
      <div className='flex flex-col items-center p-[28px]'>
        <SideNavSection>
          <div className='pt-3 pb-1 bg-white-100 dark:bg-gray-900'>
            <ToggleCard
              imgSrc={Images.Misc.VisibilityOff}
              isEnabled={hideAssetsStore.isHidden}
              isRounded={false}
              className='[&_input]:shrink-0'
              size='sm'
              title='Hide Assets'
              subtitle='Balances will be hidden upon loading wallet'
              onClick={() => {
                hideAssetsStore.setHidden(!hideAssetsStore.isHidden)
              }}
            />
          </div>

          {NavOptions.map((navOption) => {
            if (navOption.disabled) {
              return null
            }

            return (
              <React.Fragment key={navOption.property}>
                <CardDivider />
                <div className='py-1 bg-white-100 dark:bg-gray-900'>
                  <NavCard
                    imgSrc={navOption.imgSrc}
                    property={navOption.property}
                    value={navOption.value}
                    onClick={navOption.onClick}
                  />
                </div>
              </React.Fragment>
            )
          })}
        </SideNavSection>
      </div>
      <SetLockTimerDropUp
        isVisible={showLockTimeDropUp}
        onCloseHandler={() => setShowLockTimeDropUp(false)}
      />
    </div>
  )
})

export default GeneralSecurity
