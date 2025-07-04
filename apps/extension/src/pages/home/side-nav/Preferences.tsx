import { CardDivider } from '@leapwallet/leap-ui'
import { Clock } from '@phosphor-icons/react'
import BottomModal from 'components/new-bottom-modal'
import { Switch } from 'components/ui/switch'
import { DollarCircleIcon } from 'icons/dollar-icon'
import { NetworkNodeIcon } from 'icons/network-node'
import { ThemeIcon } from 'icons/theme'
import { WalletIcon } from 'icons/wallet-icon'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { hidePercentChangeStore } from 'stores/hide-percent-change'
import { hideSmallBalancesStore } from 'stores/hide-small-balances-store'

import { SideNavSection } from '.'
import ChangeCurrency from './ChangeCurrency'
import { CustomEndpoints } from './CustomEndpoints'
import { NavItem } from './NavItem'
import ThemeDropUp from './Theme'

enum PreferencesTab {
  Currency = 'Currency',
  Theme = 'Theme',
  CustomEndpoints = 'CustomEndpoints',
}

const SmallBalancesToggle = observer(() => {
  return (
    <Switch
      className='data-[state=unchecked]:bg-secondary-400'
      checked={hideSmallBalancesStore.isHidden}
    />
  )
})

const PercentChangeToggle = observer(() => {
  return (
    <Switch
      className='data-[state=unchecked]:bg-secondary-400'
      checked={hidePercentChangeStore.isHidden}
    />
  )
})

const preferences = [
  [
    {
      tab: PreferencesTab.Currency,
      title: 'Currency',
      icon: <DollarCircleIcon />,
    },
  ],
  [
    {
      tab: PreferencesTab.Theme,
      title: 'Theme',
      icon: <ThemeIcon />,
    },
  ],
  [
    {
      tab: PreferencesTab.CustomEndpoints,
      title: 'Custom Endpoints',
      icon: <NetworkNodeIcon />,
    },
    {
      title: 'Hide 24h price change',
      icon: <Clock weight='fill' />,
      trailingIcon: <PercentChangeToggle />,
      onClick: () => hidePercentChangeStore.setHidden(!hidePercentChangeStore.isHidden),
    },
    {
      title: 'Hide small balances',
      icon: <WalletIcon />,
      trailingIcon: <SmallBalancesToggle />,
      onClick: () => hideSmallBalancesStore.setHidden(!hideSmallBalancesStore.isHidden),
    },
  ],
]

const PreferencesView = ({ isVisible, goBack }: { isVisible: boolean; goBack: () => void }) => {
  const [selectedTab, setSelectedTab] = useState<PreferencesTab | null>(null)

  return (
    <>
      <BottomModal
        fullScreen
        isOpen={isVisible}
        onClose={() => {
          setSelectedTab(null)
          goBack()
        }}
        title='Preferences'
        className='pb-7 pt-2 !px-5'
      >
        {preferences.map((group) => (
          <SideNavSection key={group[0].title}>
            {group.map((item, index) => {
              return (
                <React.Fragment key={item.title}>
                  {index !== 0 && <CardDivider />}
                  <NavItem
                    label={item.title}
                    icon={item.icon}
                    trailingIcon={item.trailingIcon}
                    onClick={() => {
                      if (item.tab) {
                        setSelectedTab(item.tab)
                      }
                      if (item.onClick) {
                        item.onClick()
                      }
                    }}
                  />
                </React.Fragment>
              )
            })}
          </SideNavSection>
        ))}
      </BottomModal>

      <CustomEndpoints
        isVisible={selectedTab === PreferencesTab.CustomEndpoints}
        goBack={() => setSelectedTab(null)}
      />

      <ThemeDropUp
        isVisible={selectedTab === PreferencesTab.Theme}
        onCloseHandler={() => setSelectedTab(null)}
      />

      <ChangeCurrency
        isVisible={selectedTab === PreferencesTab.Currency}
        goBack={() => setSelectedTab(null)}
      />
    </>
  )
}

export const Preferences = observer(PreferencesView)
