import { useActiveChain, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import { Faders, GlobeHemisphereWest } from '@phosphor-icons/react'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useAuth } from 'context/auth-context'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { LockIcon } from 'icons/lock'
import { Phone } from 'icons/phone'
import { ShieldIcon } from 'icons/shield'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { globalSheetsStore } from 'stores/global-sheets-store'

import { SideNavSection } from '.'
import { NavItem } from './NavItem'
import { NavPages } from './types'

const SecurityView = ({ setShowNavPage }: { setShowNavPage: (page: NavPages) => void }) => {
  const { activeWallet } = useActiveWallet()
  const auth = useAuth()
  const activeChain = useActiveChain()

  const privacyOpts = useMemo(
    () => [
      {
        title: 'Security & Privacy',
        titleIcon: ShieldIcon,
        onClick: () => {
          setShowNavPage(NavPages.Security)
        },
        enabled: true,
        'data-testing-id': 'sidenav-security-privacy-card',
      },

      {
        title: 'Preferences',
        titleIcon: Faders,
        onClick: () => {
          setShowNavPage(NavPages.Preferences)
        },
        enabled: true,
        'data-testing-id': 'sidenav-lock-wallet-card',
      },
      {
        title: 'Sync with Mobile App',
        titleIcon: Phone,
        onClick: () => {
          setShowNavPage(NavPages.SyncWithMobile)
        },
        enabled: activeWallet?.walletType !== WALLETTYPE.LEDGER,
      },
      {
        title: 'Network',
        titleIcon: GlobeHemisphereWest,
        onClick: () => {
          setShowNavPage(NavPages.Network)
        },
        enabled: (activeChain as string) !== AGGREGATED_CHAIN_KEY,
        'data-testing-id': 'sidenav-network-card',
      },
      {
        title: 'Lock Wallet',
        titleIcon: LockIcon,
        trailingIcon: <></>,
        onClick: () => {
          auth?.signout(() => {
            globalSheetsStore.setSideNavOpen(false)
          })
        },
        enabled: true,
        'data-testing-id': 'sidenav-lock-wallet-card',
      },
    ],
    [activeWallet?.walletType, auth, setShowNavPage],
  )

  return (
    <SideNavSection>
      {privacyOpts
        .filter((item) => item.enabled)
        .map((item, index) => {
          return (
            <React.Fragment key={item.title}>
              {index !== 0 && <CardDivider />}
              <NavItem
                label={item.title}
                icon={<item.titleIcon />}
                onClick={item.onClick}
                trailingIcon={item.trailingIcon}
                data-testing-id={item['data-testing-id'] ?? ''}
              />
            </React.Fragment>
          )
        })}
    </SideNavSection>
  )
}

export const Security = observer(SecurityView)
