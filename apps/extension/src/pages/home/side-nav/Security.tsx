import { WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, NavCard, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { useAuth } from 'context/auth-context'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { DEBUG } from 'utils/debug'
import { isCompassWallet } from 'utils/isCompassWallet'

import { NavPages, SideNavSection, SideNavSectionHeader } from '.'

export const Security = observer(
  ({
    setShowNavPage,
    setShowGSDropUp,
  }: {
    setShowNavPage: (page: NavPages) => void
    setShowGSDropUp: (show: boolean) => void
  }) => {
    const auth = useAuth()
    const { theme } = useTheme()
    const isDark = theme === ThemeName.DARK

    const { activeWallet } = useActiveWallet()

    const managePasswords = useMemo(() => {
      const managePasswords = []
      if (!activeWallet?.watchWallet) {
        managePasswords.push(
          {
            title: 'Show Recovery Phrase',
            titleIcon: Images.Nav.SecretPhrase,
            onClick: () => setShowNavPage(NavPages.ExportSeedPhrase),
            enabled:
              activeWallet?.walletType === WALLETTYPE.SEED_PHRASE ||
              activeWallet?.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED,
            'data-testing-id': 'sidenav-show-secret-phrase-card',
          },
          {
            title: 'Export Private Key',
            titleIcon: isDark ? Images.Nav.SecretKeyDark : Images.Nav.SecretKeyLight,
            onClick: () => setShowNavPage(NavPages.ExportPrivateKey),
            enabled: activeWallet?.walletType !== WALLETTYPE.LEDGER,
          },
        )
      }
      return managePasswords
    }, [activeWallet?.walletType, activeWallet?.watchWallet, isDark, setShowNavPage])

    const Privacy = useMemo(
      () => [
        {
          title: 'Sync with mobile app',
          titleIcon: Images.Nav.SyncMobile,
          onClick: () => {
            setShowNavPage(NavPages.SyncWithMobile)
          },
          enabled: activeWallet?.walletType !== WALLETTYPE.LEDGER && !isCompassWallet(),
        },
        {
          title: 'Security',
          titleIcon: Images.Nav.LockTimer,
          onClick: () => {
            setShowGSDropUp(true)
          },
          enabled: true,
        },
        ...managePasswords,

        // {
        //   title: 'Auto-lock timer',
        //   titleIcon: Images.Nav.getImage('lock-timer.svg'),
        //   onClick: () => {
        //     setShowLockTimeDropUp(true)
        //   },
        // },
        {
          title: 'Lock Wallet',
          titleIcon: Images.Nav.Lock,
          onClick: () => {
            auth?.signout(() => {
              DEBUG('SideNav', 'SignOut', 'success')
            })
          },
          enabled: true,
          'data-testing-id': 'sidenav-lock-wallet-card',
        },
      ],
      [activeWallet?.walletType, auth, managePasswords, setShowGSDropUp, setShowNavPage],
    )

    return (
      <SideNavSection>
        <SideNavSectionHeader>Security</SideNavSectionHeader>
        {Privacy.filter((item) => item.enabled).map((item, index) => {
          return (
            <React.Fragment key={item.title}>
              {index !== 0 && <CardDivider />}
              <NavCard
                property={item.title}
                imgSrc={item.titleIcon}
                onClick={item.onClick}
                data-testing-id={item['data-testing-id'] ?? ''}
              />
            </React.Fragment>
          )
        })}
      </SideNavSection>
    )
  },
)
