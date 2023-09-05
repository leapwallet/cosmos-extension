import { useActiveChain, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import {
  CardDivider,
  NavCard,
  SideNavHeader,
  ThemeName,
  ToggleCard,
  useTheme,
} from '@leapwallet/leap-ui'
import classnames from 'classnames'
import AlertStrip from 'components/alert-strip/AlertStrip'
import Text from 'components/text'
import { useAuth } from 'context/auth-context'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { currencyDetail, useUserPreferredCurrency } from 'hooks/settings/useCurrency'
import { useHideSmallBalances } from 'hooks/settings/useHideSmallBalances'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { useAddress } from 'hooks/wallet/useAddress'
import { Images } from 'images'
import React, { ReactElement, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Colors } from 'theme/colors'
import { DEBUG } from 'utils/debug'
import { isCompassWallet } from 'utils/isCompassWallet'
import { capitalize } from 'utils/strings'
import browser from 'webextension-polyfill'

import RequestFaucet from '../RequestFaucet'
import ChangeCurrency from './ChangeCurrency'
import { CustomEndpoints } from './CustomEndpoints'
import ExportPrivateKey from './ExportPrivateKey'
import ExportSeedPhrase from './ExportSeedPhrase'
import GeneralSecurity from './GeneralSecurity'
import NetworkDropUp from './Network'
import SyncWithMobile from './SyncWithMobile'
import ThemeDropUp from './Theme'
import VersionIndicator from './VersionIndicator'

type InitialFaucetResp = {
  msg: string
  status: 'success' | 'fail' | null
}

const initialFaucetResp: InitialFaucetResp = {
  msg: '',
  status: null,
}

export type SideNavProps = {
  readonly isShown: boolean
  readonly toggler?: () => void
}

export enum NavPages {
  // eslint-disable-next-line no-unused-vars
  ExportSeedPhrase,
  // eslint-disable-next-line no-unused-vars
  ExportPrivateKey,
  // eslint-disable-next-line no-unused-vars
  SyncWithMobile,
  // eslint-disable-next-line no-unused-vars
  SelectCurrency,
  // eslint-disable-next-line no-unused-vars
  SelectTheme,
  // eslint-disable-next-line no-unused-vars
  SelectNetwork,
  // eslint-disable-next-line no-unused-vars
  ChangeEndpoints,
}

export function SideNavSectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className='w-full h-10 px-4 pb-1 pt-5 font-bold text-xs bg-white-100 dark:bg-gray-900 dark:text-white-100'>
      {children}
    </div>
  )
}

export function SideNavSection({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={classnames('overflow-hidden rounded-2xl mt-4', className)}>{children}</div>
}

export function OverflowSideNavSection({ children }: { children: ReactNode }) {
  return <div className='rounded-2xl mt-4 min-h-fit'>{children}</div>
}

export default function SideNav({ isShown, toggler }: SideNavProps): ReactElement {
  const { theme } = useTheme()
  const currentNetwork = useSelectedNetwork()
  const [showGSDropUp, setShowGSDropUp] = useState<boolean>(false)
  const [showNetworkDropUp, setShowNetworkDropUp] = useState(false)
  const [showFaucetResp, setShowFaucetResp] = useState<InitialFaucetResp>(initialFaucetResp)
  const [selectedCurrency] = useUserPreferredCurrency()
  const [areSmallBalancesHidden, setAreSmallBalancesHidden] = useHideSmallBalances()
  const [showThemeDropUp, setShowThemeDropUp] = useState(false)
  const [showNavPage, setShowNavPage] = useState<NavPages | undefined>()
  const { activeWallet } = useActiveWallet()
  const activeChain = useActiveChain()
  const containerRef = useRef<HTMLDivElement | null>(null)

  const address = useAddress()
  const auth = useAuth()
  const isDark = theme === ThemeName.DARK
  const isInExpandView = browser.extension.getViews({ type: 'tab' }).length > 0

  const Preferences = [
    {
      title: 'Currency',
      titleIcon: Images.Nav.CurrencyIcon,
      subTitle: capitalize(currencyDetail[selectedCurrency].ISOname),
      onClick: () => {
        setShowNavPage(NavPages.SelectCurrency)
      },
      enabled: true,
    },
    // {
    //   title: 'Language',
    //   titleIcon: Images.Nav.getImage('translate.svg'),
    //   subTitle: capitalize('English'),
    //   onClick: () => {},
    // },
    {
      title: 'Network',
      titleIcon: Images.Nav.NetworkIcon,
      subTitle: capitalize(currentNetwork ?? 'mainnet'),
      onClick: () => {
        containerRef.current?.scrollTo(0, 0)
        setShowNetworkDropUp(true)
      },
      enabled: true,
    },
    // {
    //   title: 'Finder',
    //   titleIcon: Images.Nav.FinderIcon,
    //   subTitle: 'Mintscan',
    //   onClick: () => setShowFinderDropUp(true),
    // },
    {
      title: 'Theme',
      titleIcon: Images.Nav.ThemeIcon,
      subTitle: capitalize(theme),
      onClick: () => {
        containerRef.current?.scrollTo(0, 0)
        setShowThemeDropUp(true)
      },
      enabled: true,
    },
    {
      title: 'Custom endpoints',
      titleIcon: Images.Nav.CustomEndpoints,
      subTitle: '',
      onClick: () => {
        setShowNavPage(NavPages.ChangeEndpoints)
      },
      enabled: true,
    },
  ]

  const Privacy = [
    {
      title: 'Sync with mobile app',
      titleIcon: Images.Nav.SyncMobile,
      onClick: () => {
        setShowNavPage(NavPages.SyncWithMobile)
      },
      enabled: activeWallet?.walletType !== WALLETTYPE.LEDGER && !isCompassWallet(),
    },
    {
      title: 'General Security',
      titleIcon: Images.Nav.LockTimer,
      onClick: () => {
        setShowGSDropUp(true)
      },
      enabled: true,
    },
    {
      title: 'Show Secret Phrase',
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
  ]

  const resources = [
    // {
    //   title: 'Terms and Privacy',
    //   titleIcon: Images.Nav.GppGood,
    //   onclick: () => {},
    // },
    {
      title: 'Support',
      titleIcon: Images.Nav.Support,
      onclick: () => {
        window.open(
          'https://leapwallet.notion.site/Leap-Wallet-Help-Center-Cosmos-ba1da3c05d3341eaa44a1850ed3260ee',
        )
      },
      enabled: !isCompassWallet(),
    },
    {
      title: 'Twitter',
      titleIcon: Images.Nav.Twitter,
      onclick: () => {
        window.open(
          isCompassWallet()
            ? 'https://twitter.com/compass_wallet'
            : 'https://twitter.com/leap_cosmos',
        )
      },
      enabled: true,
    },
  ]

  const getPage = useCallback(() => {
    switch (showNavPage) {
      case NavPages.ExportSeedPhrase:
        return <ExportSeedPhrase goBack={() => setShowNavPage(undefined)} />
      case NavPages.ExportPrivateKey:
        return <ExportPrivateKey goBack={() => setShowNavPage(undefined)} />
      case NavPages.SyncWithMobile:
        return <SyncWithMobile goBack={() => setShowNavPage(undefined)} />
      case NavPages.SelectCurrency:
        return (
          <div className='overflow-y-scroll min-h-screen max-h-fit'>
            <ChangeCurrency
              goBack={() => {
                setShowNavPage(undefined)
              }}
            />
          </div>
        )
      case NavPages.ChangeEndpoints:
        return <CustomEndpoints goBack={() => setShowNavPage(undefined)} />
    }
  }, [showNavPage])

  const handleExpandView = useCallback(() => {
    const views = browser.extension.getViews({ type: 'popup' })
    if (views.length === 0 && toggler) {
      toggler()
    } else {
      window.open(browser.runtime.getURL('index.html'))
    }
  }, [toggler])

  useEffect(() => {
    if (isShown) {
      const sideNavParent = containerRef.current?.parentElement
      let previousScrollTop = 0
      if (sideNavParent) {
        previousScrollTop = sideNavParent.scrollTop
        sideNavParent.style.overflow = 'hidden'
        containerRef.current?.scrollIntoView()
      }
      return () => {
        if (sideNavParent && previousScrollTop > 0) {
          sideNavParent.scrollTo(0, previousScrollTop)
          sideNavParent.style.overflow = 'auto'
        }
      }
    }
  }, [isShown])

  return (
    <div
      data-testing-id='side-nav'
      ref={containerRef}
      className={classnames(
        'absolute left-0 top-0 w-[400px] overflow-clip overflow-y-auto rounded-[10px] max-h-[600px] z-[1000] transition-transform ease-in-out duration-500 dark:bg-black-100 bg-gray-50',
        {
          '-translate-x-[400px] ': !isShown,
          'translate-x-0': isShown,
          'overflow-hidden': showNetworkDropUp || showThemeDropUp,
        },
      )}
    >
      {showGSDropUp && (
        <GeneralSecurity
          goBack={() => {
            setShowGSDropUp(false)
          }}
        />
      )}
      {showNavPage !== undefined && getPage()}
      {showFaucetResp.msg && (
        <center>
          <AlertStrip
            message={showFaucetResp.msg}
            bgColor={showFaucetResp.status === 'success' ? Colors.green600 : Colors.red300}
            alwaysShow={false}
            onHide={() => {
              setShowFaucetResp(initialFaucetResp)
            }}
            className='absolute bottom-[80px] right-7 left-7 rounded-xl w-80 h-auto p-2 z-50'
            timeOut={6000}
          />
        </center>
      )}
      {showNavPage === undefined && !showGSDropUp && (
        <div className='flex flex-col h-full'>
          <div className='fixed dark:bg-black-100 bg-gray-50'>
            <div
              className='w-full h-1'
              style={{
                backgroundColor: Colors.getChainColor(activeChain),
              }}
            />
            <SideNavHeader
              brandName={isCompassWallet() ? 'COMPASS' : undefined}
              brandImage={isCompassWallet() ? <img src={Images.Logos.CompassCircle} /> : undefined}
              onBackClick={toggler}
            />
          </div>
          <div className='p-7 mt-[72px] overflow-scroll'>
            {isInExpandView ? null : (
              <NavCard
                property='Expand View'
                isRounded
                imgSrc={Images.Nav.ExportIcon}
                onClick={handleExpandView}
              />
            )}

            {currentNetwork === 'testnet' && !isInExpandView && <div className='mt-4' />}
            {currentNetwork === 'testnet' && (
              <RequestFaucet
                address={address}
                setShowFaucetResp={(data) => {
                  setShowFaucetResp(data)
                }}
              />
            )}

            <SideNavSection>
              <SideNavSectionHeader>Preferences</SideNavSectionHeader>
              {Preferences.filter((item) => item.enabled).map((item, index) => {
                return (
                  <React.Fragment key={item.title}>
                    {index !== 0 && <CardDivider />}
                    <NavCard
                      property={item.title}
                      imgSrc={item.titleIcon}
                      value={item.subTitle}
                      onClick={item.onClick}
                    />
                  </React.Fragment>
                )
              })}
              <CardDivider />
              <ToggleCard
                isRounded={false}
                size='sm'
                title='Hide small balances'
                imgSrc={Images.Nav.ChildFriendly}
                isEnabled={areSmallBalancesHidden}
                onClick={setAreSmallBalancesHidden}
              />
            </SideNavSection>
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

            <SideNavSection>
              <SideNavSectionHeader>Resources</SideNavSectionHeader>
              {resources
                .filter((item) => item.enabled)
                .map((item, index) => {
                  return (
                    <React.Fragment key={item.title}>
                      {index !== 0 && <CardDivider />}
                      <NavCard
                        property={item.title}
                        imgSrc={item.titleIcon}
                        onClick={item.onclick}
                      />
                    </React.Fragment>
                  )
                })}
            </SideNavSection>

            <div className='flex flex-col justify-center items-center  mt-[80px] mb-[60px] ml-[24px] mr-[24px]'>
              <Text
                size='xl'
                color='text-center text-gray-600 dark:text-gray-200 font-bold mb-[10px]'
              >
                {isCompassWallet() ? 'Compass' : 'Leap'} Wallet
              </Text>
              <VersionIndicator />
            </div>
          </div>
        </div>
      )}
      {showNetworkDropUp && (
        <NetworkDropUp
          isVisible={showNetworkDropUp}
          onCloseHandler={() => setShowNetworkDropUp(false)}
        />
      )}
      {/* {showFinderDropUp && <FinderDropUp onCloseHandler={() => setShowFinderDropUp(false)} />} */}
      {showThemeDropUp && (
        <ThemeDropUp isVisible={showThemeDropUp} onCloseHandler={() => setShowThemeDropUp(false)} />
      )}
    </div>
  )
}
