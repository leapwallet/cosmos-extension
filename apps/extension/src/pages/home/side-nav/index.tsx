import { useActiveChain, useFeatureFlags, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, NavCard, SideNavHeader, ThemeName, useTheme } from '@leapwallet/leap-ui'
import classnames from 'classnames'
import { AlertStrip } from 'components/alert-strip'
import { BetaTag } from 'components/BetaTag/BetaTag'
import Text from 'components/text'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useAuth } from 'context/auth-context'
import { useChainPageInfo } from 'hooks'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { currencyDetail, useUserPreferredCurrency } from 'hooks/settings/useCurrency'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { ReactElement, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { chainTagsStore } from 'stores/chain-infos-store'
import { manageChainsStore } from 'stores/manage-chains-store'
import { Colors } from 'theme/colors'
import { AggregatedSupportedChain } from 'types/utility'
import { DEBUG } from 'utils/debug'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
import { capitalize } from 'utils/strings'
import browser from 'webextension-polyfill'

import ChangeCurrency from './ChangeCurrency'
import { CustomEndpoints } from './CustomEndpoints'
import ExportPrivateKey from './ExportPrivateKey'
import ExportSeedPhrase from './ExportSeedPhrase'
import GeneralSecurity from './GeneralSecurity'
import LightNode from './LightNode/LightNode'
import NetworkDropUp from './Network'
import SyncWithMobile from './SyncWithMobile'
import ThemeDropUp from './Theme'
import { TokenDisplay } from './TokenDisplay'
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
  readonly defaults?: {
    openLightNodePage: boolean
  }
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
  // eslint-disable-next-line no-unused-vars
  ManageAuthz,
  // eslint-disable-next-line no-unused-vars
  LightNode,
  // eslint-disable-next-line no-unused-vars
  TokenDisplay,
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

const SideNav = observer(({ isShown, toggler, defaults }: SideNavProps): ReactElement => {
  const { theme } = useTheme()
  const currentNetwork = useSelectedNetwork()
  const [showGSDropUp, setShowGSDropUp] = useState(false)
  const [showNetworkDropUp, setShowNetworkDropUp] = useState(false)
  const [showFaucetResp, setShowFaucetResp] = useState<InitialFaucetResp>(initialFaucetResp)
  const [selectedCurrency] = useUserPreferredCurrency()
  const [showThemeDropUp, setShowThemeDropUp] = useState(false)
  const [showNavPage, setShowNavPage] = useState<NavPages | undefined>()
  const { activeWallet } = useActiveWallet()
  const activeChain = useActiveChain() as AggregatedSupportedChain
  const containerRef = useRef<HTMLDivElement | null>(null)

  const auth = useAuth()
  const isDark = theme === ThemeName.DARK
  const isInExpandView = browser.extension.getViews({ type: 'tab' }).length > 0
  const { topChainColor } = useChainPageInfo()
  const { data: featureFlags } = useFeatureFlags()

  const LightNodeItem = {
    title: 'Celestia Light Node',
    titleIcon: Images.Misc.Sampling,
    subTitle: '',
    onClick: () => {
      setShowNavPage(NavPages.LightNode)
    },
    enabled: !isCompassWallet() && featureFlags?.light_node?.extension === 'active',
  }

  const manageChain = manageChainsStore.chains.find((chain) => chain.chainName === activeChain)

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
      enabled: !(
        (isCompassWallet() && activeChain === 'seiDevnet') ||
        activeChain === AGGREGATED_CHAIN_KEY ||
        manageChain?.beta
      ),
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
    LightNodeItem,
    {
      title: 'Custom endpoints',
      titleIcon: Images.Nav.CustomEndpoints,
      subTitle: '',
      onClick: () => {
        setShowNavPage(NavPages.ChangeEndpoints)
      },
      enabled: true,
    },
    {
      title: 'Token Display',
      titleIcon: Images.Nav.DollarCard,
      subTitle: '',
      onClick: () => {
        setShowNavPage(NavPages.TokenDisplay)
      },
      enabled: true,
    },
  ]

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
            : 'https://twitter.com/leap_wallet',
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
        return (
          <CustomEndpoints
            goBack={() => setShowNavPage(undefined)}
            chainTagsStore={chainTagsStore}
          />
        )
      case NavPages.LightNode:
        return (
          <LightNode
            goBack={(toHome?: boolean) => {
              setShowNavPage(undefined)
              if (toHome) {
                toggler?.()
              }
            }}
          />
        )
      case NavPages.TokenDisplay:
        return <TokenDisplay goBack={() => setShowNavPage(undefined)} />
    }
  }, [showNavPage, toggler])

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

  useEffect(() => {
    if (defaults?.openLightNodePage) {
      setShowNavPage(NavPages.LightNode)
    }
  }, [defaults])

  return (
    <div
      data-testing-id='side-nav'
      ref={containerRef}
      className={classnames(
        'absolute left-0 top-0 enclosing-panel panel-width panel-height overflow-clip overflow-y-auto rounded-[10px] z-[1000] transition-transform ease-in-out duration-500 dark:bg-black-100 bg-gray-50',
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
          chainTagsStore={chainTagsStore}
        />
      )}
      {showNavPage !== undefined && getPage()}
      {showFaucetResp.msg && (
        <div className='text-center'>
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
        </div>
      )}
      {showNavPage === undefined && !showGSDropUp && (
        <div className='flex flex-col h-full enclosing-panel'>
          <div className='fixed dark:bg-black-100 bg-gray-50'>
            <div className='w-full h-1' style={{ backgroundColor: topChainColor }} />
            <SideNavHeader
              brandName={isCompassWallet() ? 'COMPASS' : ''}
              brandImage={
                isCompassWallet() ? (
                  <img src={Images.Logos.CompassCircle} />
                ) : (
                  <img
                    src={isDark ? Images.Logos.LeapDarkMode : Images.Logos.LeapLightMode}
                    className={'h-[30px]'}
                  />
                )
              }
              onBackClick={toggler}
            />
          </div>
          <div className='p-7 mt-[72px] overflow-scroll'>
            {isInExpandView || isSidePanel() ? null : (
              <NavCard
                property='Expand View'
                isRounded
                imgSrc={Images.Nav.ExportIcon}
                onClick={handleExpandView}
              />
            )}

            <SideNavSection>
              <SideNavSectionHeader>Preferences</SideNavSectionHeader>
              {Preferences.filter((item) => item.enabled).map((item, index) => {
                return (
                  <React.Fragment key={item.title}>
                    {index !== 0 && <CardDivider />}
                    {item.title === LightNodeItem.title ? (
                      <div key={item.title} className='relative'>
                        <NavCard
                          property={item.title}
                          imgSrc={item.titleIcon}
                          value={item.subTitle}
                          onClick={item.onClick}
                        />
                        <BetaTag className='top-[18px] left-[202px]' />
                      </div>
                    ) : (
                      <NavCard
                        property={item.title}
                        imgSrc={item.titleIcon}
                        value={item.subTitle}
                        onClick={item.onClick}
                      />
                    )}
                  </React.Fragment>
                )
              })}
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
      <NetworkDropUp
        isVisible={showNetworkDropUp}
        onCloseHandler={() => setShowNetworkDropUp(false)}
      />
      {/* {showFinderDropUp && <FinderDropUp onCloseHandler={() => setShowFinderDropUp(false)} />} */}

      <ThemeDropUp isVisible={showThemeDropUp} onCloseHandler={() => setShowThemeDropUp(false)} />
    </div>
  )
})

export default SideNav
