import { WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider } from '@leapwallet/leap-ui'
import { EyeSlash } from '@phosphor-icons/react/dist/ssr'
import BottomModal from 'components/new-bottom-modal'
import { Switch } from 'components/ui/switch'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { AuthZIcon } from 'icons/auth-z'
import { GlobeIcon } from 'icons/globe'
import { KeyIcon } from 'icons/key-icon'
import { StopWatch } from 'icons/stop-watch'
import { UserKeyIcon } from 'icons/user-key'
import { observer } from 'mobx-react-lite'
import React, { ReactElement, useState } from 'react'
import { hideAssetsStore } from 'stores/hide-assets-store'

import { SideNavSection } from '.'
import ConnectedSites from './ConnectedSites'
import ExportPrivateKey from './ExportPrivateKey'
import ExportSeedPhrase from './ExportSeedPhrase'
import { ManageAuthZ } from './ManageAuthZ'
import { NavItem } from './NavItem'
import SetLockTimerDropUp from './SetLockTimer'

export enum GENERAL_SECURITY_PAGES {
  CONNECTED_SITES = 'CONNECTED_SITES',
  RECOVERY_PHRASE = 'RECOVERY_PHRASE',
  PRIVATE_KEY = 'PRIVATE_KEY',
  AUTO_LOCK_TIMER = 'AUTO_LOCK_TIMER',
  MANAGE_AUTHZ = 'MANAGE_AUTHZ',
}

const HideAssetsToggle = observer(() => {
  return (
    <Switch
      className='data-[state=unchecked]:bg-secondary-400'
      checked={hideAssetsStore.isHidden}
      onCheckedChange={() => hideAssetsStore.setHidden(!hideAssetsStore.isHidden)}
    />
  )
})

const securityOptions: {
  tab: GENERAL_SECURITY_PAGES | null
  label: string
  icon: React.ReactNode
  onClick?: () => void
  trailingIcon?: React.ReactNode
  'data-testing-id'?: string
}[][] = [
  [
    {
      tab: GENERAL_SECURITY_PAGES.RECOVERY_PHRASE,
      label: 'Show Recovery Phrase',
      icon: <UserKeyIcon />,
      'data-testing-id': 'sidenav-show-secret-phrase-card',
    },
    {
      tab: GENERAL_SECURITY_PAGES.PRIVATE_KEY,
      label: 'Show Private Key',
      icon: <KeyIcon />,
      'data-testing-id': 'sidenav-show-private-key-card',
    },
  ],
  [
    {
      tab: GENERAL_SECURITY_PAGES.CONNECTED_SITES,
      label: 'Connected sites',
      icon: <GlobeIcon />,
      'data-testing-id': 'sidenav-connected-sites-card',
    },
    {
      tab: GENERAL_SECURITY_PAGES.MANAGE_AUTHZ,
      label: 'Manage AuthZ',
      icon: <AuthZIcon />,
      'data-testing-id': 'sidenav-manage-authz-card',
    },
  ],
  [
    {
      tab: GENERAL_SECURITY_PAGES.AUTO_LOCK_TIMER,
      label: 'Auto-Lock Timer',
      icon: <StopWatch />,
      'data-testing-id': 'sidenav-auto-lock-timer-card',
    },
    {
      tab: null,
      label: 'Hide Assets',
      icon: <EyeSlash weight='fill' />,
      trailingIcon: <HideAssetsToggle />,
    },
  ],
]

const GeneralSecurityView = ({
  isVisible,
  goBack,
}: {
  isVisible: boolean
  goBack: () => void
}): ReactElement => {
  const [selectedTab, setSelectedTab] = useState<GENERAL_SECURITY_PAGES | null>(null)
  const { activeWallet } = useActiveWallet()

  const isPrivateKeyEnabled = activeWallet?.walletType !== WALLETTYPE.LEDGER
  const isRecoveryPhraseEnabled =
    activeWallet?.walletType === WALLETTYPE.SEED_PHRASE ||
    activeWallet?.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED

  const onClose = () => {
    setSelectedTab(null)
  }

  return (
    <>
      <BottomModal
        fullScreen
        isOpen={isVisible}
        onClose={goBack}
        title='Security'
        className='pb-7 pt-2 !px-5'
      >
        {securityOptions.map((group) => (
          <SideNavSection key={group[0].label}>
            {group.map((item, index) => {
              if (item.tab === GENERAL_SECURITY_PAGES.PRIVATE_KEY && !isPrivateKeyEnabled) {
                return null
              }

              if (item.tab === GENERAL_SECURITY_PAGES.RECOVERY_PHRASE && !isRecoveryPhraseEnabled) {
                return null
              }

              return (
                <React.Fragment key={item.label}>
                  {index !== 0 && <CardDivider />}
                  <NavItem
                    label={item.label}
                    icon={item.icon}
                    trailingIcon={item.trailingIcon}
                    data-testing-id={item['data-testing-id']}
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

      <ExportSeedPhrase
        isVisible={selectedTab === GENERAL_SECURITY_PAGES.RECOVERY_PHRASE}
        onClose={onClose}
      />

      <ExportPrivateKey
        isVisible={selectedTab === GENERAL_SECURITY_PAGES.PRIVATE_KEY}
        onClose={onClose}
      />

      <SetLockTimerDropUp
        isVisible={selectedTab === GENERAL_SECURITY_PAGES.AUTO_LOCK_TIMER}
        onClose={onClose}
      />

      <ManageAuthZ
        isVisible={selectedTab === GENERAL_SECURITY_PAGES.MANAGE_AUTHZ}
        onClose={onClose}
      />

      <ConnectedSites
        isVisible={selectedTab === GENERAL_SECURITY_PAGES.CONNECTED_SITES}
        onClose={onClose}
      />
    </>
  )
}

export default observer(GeneralSecurityView)
