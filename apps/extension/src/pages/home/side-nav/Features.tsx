import { useChainInfo, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks'
import { isAptosChain, isSolanaChain } from '@leapwallet/cosmos-wallet-sdk'
import { isBitcoinChain } from '@leapwallet/cosmos-wallet-store/dist/utils'
import { CardDivider } from '@leapwallet/leap-ui'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { AirdropIcon } from 'icons/airdrop'
import { CelestiaIcon } from 'icons/celestia'
import Vote from 'icons/vote'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { globalSheetsStore } from 'stores/global-sheets-store'
import { AggregatedSupportedChain } from 'types/utility'

import { SideNavSection } from '.'
import { NavItem } from './NavItem'
import { NavPages } from './types'

export const Features = observer(
  ({ setShowNavPage }: { setShowNavPage: (page: NavPages) => void }) => {
    const navigate = useNavigate()
    const { data: featureFlags } = useFeatureFlags()
    const isAirdropsEnabled = featureFlags?.airdrops?.extension !== 'disabled'
    const activeChain = useActiveChain()
    const chain = useChainInfo()

    const isVoteHidden =
      ['aggregated', 'noble'].includes(activeChain as AggregatedSupportedChain) ||
      !!chain?.evmOnlyChain ||
      isAptosChain(chain?.key) ||
      isBitcoinChain(chain?.key) ||
      isSolanaChain(chain?.key)

    const featuresOpts = useMemo(() => {
      const features = [
        {
          title: 'Airdrops',
          titleIcon: <AirdropIcon />,
          onClick: () => {
            navigate(`/airdrops`)
            globalSheetsStore.toggleSideNav()
          },
          enabled: isAirdropsEnabled,
        },
        {
          title: 'Vote',
          titleIcon: <Vote weight='fill' />,
          onClick: () => {
            navigate(`/gov`)
            globalSheetsStore.toggleSideNav()
          },
          enabled: !isVoteHidden,
        },
        {
          title: 'Celestia Light Node',
          titleIcon: <CelestiaIcon />,
          onClick: () => {
            setShowNavPage(NavPages.LightNode)
          },
          enabled: featureFlags?.light_node?.extension === 'active',
        },
      ]

      return features
    }, [isAirdropsEnabled, isVoteHidden, navigate])

    if (featuresOpts.length === 0) return null

    return (
      <SideNavSection className='py-0'>
        {featuresOpts.map((item, index) => {
          return (
            item.enabled && (
              <React.Fragment key={item.title}>
                {index !== 0 && <CardDivider />}
                <NavItem label={item.title} icon={item.titleIcon} onClick={item.onClick} />
              </React.Fragment>
            )
          )
        })}
      </SideNavSection>
    )
  },
)
