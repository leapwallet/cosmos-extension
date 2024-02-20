import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { NavCard, SideNavHeader, ThemeName } from '@leapwallet/leap-ui'
import classnames from 'classnames'
import React, { useMemo, useState } from 'react'

import CardDivider from '~/components/card-divider'
import Text from '~/components/text'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { currencyDetail, usePreferredCurrency } from '~/hooks/settings/use-currency'
import { useCurrentNetwork } from '~/hooks/settings/use-current-network'
import { useThemeState } from '~/hooks/settings/use-theme'
import { Images } from '~/images'
import { Colors } from '~/theme/colors'
import { capitalize } from '~/util/strings'

import ChangeCurrency from './change-currency'
import { SideNavSection, SideNavSectionHeader } from './elements'
import GeneralSecurity from './general-security'
import NetworkDropUp from './network-drop-up'
import ThemeDropUp from './theme-drop-up'

type Props = {
  isShown: boolean
  toggler: () => void
}

const resources = [
  {
    title: 'Terms and Privacy',
    titleIcon: Images.Nav.GppGood,
    onclick: () => {
      window.open(
        'https://leapwallet.notion.site/Leap-Wallet-Help-Center-Cosmos-ba1da3c05d3341eaa44a1850ed3260ee',
        '_blank',
      )
    },
    enabled: true,
  },
  {
    title: 'Support',
    titleIcon: Images.Nav.Support,
    onclick: () => {
      window.open(
        'https://leapwallet.notion.site/Leap-Wallet-Help-Center-Cosmos-ba1da3c05d3341eaa44a1850ed3260ee',
        '_blank',
      )
    },
    enabled: true,
  },
  {
    title: 'Twitter',
    titleIcon: Images.Nav.Twitter,
    onclick: () => {
      window.open('https://twitter.com/leap_cosmos', '_blank')
    },
    enabled: true,
  },
]

const SideNav: React.FC<Props> = ({ isShown, toggler }) => {
  const [showThemeDropUp, setShowThemeDropUp] = useState(false)
  const [showNetworkDropUp, setShowNetworkDropUp] = useState(false)
  const [showCurrencyDropUp, setShowCurrencyDropUp] = useState(false)
  const [showGSDropUp, setShowGSDropUp] = useState(false)

  const activeChain = useActiveChain()
  const currentNetwork = useCurrentNetwork()
  const preferredCurrency = usePreferredCurrency()
  const { theme } = useThemeState()

  const preferences = useMemo(
    () => [
      {
        title: 'Currency',
        titleIcon: Images.Nav.CurrencyIcon,
        subTitle: capitalize(currencyDetail[preferredCurrency].ISOname),
        onClick: () => {
          setShowCurrencyDropUp(true)
        },
        enabled: true,
      },
      {
        title: 'Network',
        titleIcon: Images.Nav.NetworkIcon,
        subTitle: capitalize(currentNetwork ?? 'mainnet'),
        onClick: () => {
          setShowNetworkDropUp(true)
        },
        enabled: true,
      },
      {
        title: 'Theme',
        titleIcon: Images.Nav.ThemeIcon,
        subTitle: capitalize(theme),
        onClick: () => setShowThemeDropUp(true),
        enabled: true,
      },
    ],
    [currentNetwork, theme, preferredCurrency],
  )

  const privacy = useMemo(
    () => [
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
        onClick: () => {},
        enabled: true,
      },
      {
        title: 'Export Private Key',
        titleIcon: theme === ThemeName.DARK ? Images.Nav.SecretKeyDark : Images.Nav.SecretKeyLight,
        onClick: () => {},
        enabled: true,
      },
      {
        title: 'Lock Wallet',
        titleIcon: Images.Nav.Lock,
        onClick: () => {},
        enabled: true,
      },
    ],
    [theme],
  )

  return (
    <div
      className={classnames(
        'absolute left-0 top-0 w-full overflow-clip rounded-[10px] h-full z-[1000] transition-transform ease-in-out duration-500 dark:bg-black-100 bg-gray-50 ',
        {
          '-translate-x-[100%] ': !isShown,
          'translate-x-0': isShown,
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
      {showCurrencyDropUp && (
        <ChangeCurrency
          goBack={() => {
            setShowCurrencyDropUp(false)
          }}
        />
      )}
      {!showGSDropUp && (
        <div className='flex flex-col h-full'>
          <div className='fixed dark:bg-black-100 bg-gray-50 side-nav-header'>
            <Text
              size='xs'
              style={{ color: Colors.getChainColor(activeChain) }}
              className='absolute z-10 top-[34px] font-bold left-[140px]'
            >
              BETA
            </Text>
            <div
              className='w-full h-1'
              style={{ backgroundColor: ChainInfos[activeChain].theme.primaryColor }}
            />
            <SideNavHeader onBackClick={toggler} />
          </div>
          <div className='p-7 mt-[72px] overflow-scroll'>
            <SideNavSection>
              <SideNavSectionHeader>Preferences</SideNavSectionHeader>
              {preferences
                .filter((item) => item.enabled)
                .map((item, index) => {
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
            </SideNavSection>
            <SideNavSection>
              <SideNavSectionHeader>Security</SideNavSectionHeader>
              {privacy
                .filter((item) => item.enabled)
                .map((item, index) => {
                  return (
                    <React.Fragment key={item.title}>
                      {index !== 0 && <CardDivider />}
                      <NavCard
                        property={item.title}
                        imgSrc={item.titleIcon}
                        onClick={item.onClick}
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
                Leap Wallet
              </Text>
              <Text size='sm' color='text-center text-gray-400 font-bold'>
                Version 0.1.11
              </Text>
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
      {showThemeDropUp && (
        <ThemeDropUp isVisible={showThemeDropUp} onCloseHandler={() => setShowThemeDropUp(false)} />
      )}
    </div>
  )
}

export default SideNav
