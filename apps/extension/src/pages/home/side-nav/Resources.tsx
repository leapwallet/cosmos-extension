import { CardDivider } from '@leapwallet/leap-ui'
import { ExternalLinkIcon } from 'icons/external-link'
import { HeadphoneIcon } from 'icons/headphone'
import { XIcon } from 'icons/x'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { SideNavSection } from '.'
import { NavItem } from './NavItem'

const resources = [
  {
    testId: 'sidenav-support-card',
    title: 'Support',
    titleIcon: HeadphoneIcon,
    onclick: () => {
      window.open(
        'https://leapwallet.notion.site/Leap-Wallet-Help-Center-Cosmos-ba1da3c05d3341eaa44a1850ed3260ee',
      )
    },
    enabled: true,
  },
  {
    testId: 'sidenav-twitter-card',
    title: 'Twitter',
    titleIcon: XIcon,
    onclick: () => {
      window.open('https://x.com/leap_wallet')
    },
    enabled: true,
  },
]

export const Resources = observer(() => {
  return (
    <SideNavSection>
      {resources
        .filter((item) => item.enabled)
        .map((item, index) => {
          return (
            <React.Fragment key={item.title}>
              {index !== 0 && <CardDivider />}
              <NavItem
                label={item.title}
                icon={<item.titleIcon />}
                onClick={item.onclick}
                data-testing-id={item.testId}
                trailingIcon={<ExternalLinkIcon className='!size-4 text-muted-foreground' />}
              />
            </React.Fragment>
          )
        })}
    </SideNavSection>
  )
})
