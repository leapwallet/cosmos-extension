import { CardDivider, NavCard } from '@leapwallet/leap-ui'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

import { SideNavSection, SideNavSectionHeader } from '.'

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

export const Resources = observer(() => {
  return (
    <SideNavSection>
      <SideNavSectionHeader>Resources</SideNavSectionHeader>
      {resources
        .filter((item) => item.enabled)
        .map((item, index) => {
          return (
            <React.Fragment key={item.title}>
              {index !== 0 && <CardDivider />}
              <NavCard property={item.title} imgSrc={item.titleIcon} onClick={item.onclick} />
            </React.Fragment>
          )
        })}
    </SideNavSection>
  )
})
