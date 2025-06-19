import { useChainInfo, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks'
import { isAptosChain, isSolanaChain } from '@leapwallet/cosmos-wallet-sdk'
import { isBitcoinChain } from '@leapwallet/cosmos-wallet-store/dist/utils'
import { CardDivider, NavCard } from '@leapwallet/leap-ui'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { globalSheetsStore } from 'stores/global-sheets-store'
import { AggregatedSupportedChain } from 'types/utility'

import { SideNavSection, SideNavSectionContent, SideNavSectionHeader } from '.'

export const Features = observer(() => {
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

  const Features = useMemo(() => {
    const features = []

    if (isAirdropsEnabled) {
      features.push({
        title: 'Airdrops',
        titleIcon: Images.Misc.Parachute,
        onClick: () => {
          navigate(`/airdrops`)
          globalSheetsStore.toggleSideNav()
        },
        enabled: true,
      })
    }

    if (!isVoteHidden) {
      features.push({
        title: 'Vote',
        titleIcon: Images.Misc.Globe,
        onClick: () => {
          navigate(`/gov`)
          globalSheetsStore.toggleSideNav()
        },
        enabled: !isVoteHidden,
      })
    }

    return features
  }, [isAirdropsEnabled, isVoteHidden, navigate])

  return (
    <SideNavSection>
      <SideNavSectionHeader>Features</SideNavSectionHeader>
      <SideNavSectionContent className='py-0'>
        {Features.filter((item) => item.enabled).map((item, index) => {
          return (
            <React.Fragment key={item.title}>
              {index !== 0 && <CardDivider />}
              <NavCard property={item.title} imgSrc={item.titleIcon} onClick={item.onClick} />
            </React.Fragment>
          )
        })}
      </SideNavSectionContent>
    </SideNavSection>
  )
})
