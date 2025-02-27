import { useActiveChain, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks'
import { CardDivider, NavCard, useTheme } from '@leapwallet/leap-ui'
import { BetaTag } from 'components/BetaTag/BetaTag'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { currencyDetail, useUserPreferredCurrency } from 'hooks/settings/useCurrency'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { manageChainsStore } from 'stores/manage-chains-store'
import { AggregatedSupportedChain } from 'types/utility'
import { isCompassWallet } from 'utils/isCompassWallet'
import { capitalize } from 'utils/strings'

import { NavPages, SideNavSection, SideNavSectionHeader } from '.'

export const Preferences = observer(
  ({
    setShowNavPage,
    containerRef,
    setShowNetworkDropUp,
    setShowThemeDropUp,
  }: {
    setShowNavPage: (page: NavPages) => void
    containerRef: React.RefObject<HTMLDivElement>
    setShowNetworkDropUp: (show: boolean) => void
    setShowThemeDropUp: (show: boolean) => void
  }) => {
    const { data: featureFlags } = useFeatureFlags()
    const { theme } = useTheme()
    const currentNetwork = useSelectedNetwork()
    const [selectedCurrency] = useUserPreferredCurrency()
    const activeChain = useActiveChain() as AggregatedSupportedChain

    const LightNodeItem = useMemo(
      () => ({
        title: 'Celestia Light Node',
        titleIcon: Images.Misc.Sampling,
        subTitle: '',
        onClick: () => {
          setShowNavPage(NavPages.LightNode)
        },
        enabled: !isCompassWallet() && featureFlags?.light_node?.extension === 'active',
      }),
      [featureFlags?.light_node?.extension, setShowNavPage],
    )

    const manageChain = manageChainsStore.chains.find((chain) => chain.chainName === activeChain)

    const Preferences = useMemo(
      () => [
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
      ],
      [LightNodeItem, activeChain, currentNetwork, manageChain?.beta, selectedCurrency, theme],
    )

    return (
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
    )
  },
)
