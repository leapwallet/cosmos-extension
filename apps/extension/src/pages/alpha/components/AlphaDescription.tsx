import { Separator } from 'components/ui/separator'
import { EventName, PageName } from 'config/analytics'
import mixpanel from 'mixpanel-browser'
import React from 'react'
import Markdown from 'react-markdown'
import gfm from 'remark-gfm'

import { RaffleListingProps } from '../chad-components/RaffleListing'
import { getHostname } from '../utils'
import { AlphaOpportunityProps } from './AlphaOpportunity'

const remarkPlugins = [gfm]

/**
 * renders the description for a Alpha listing using markdown
 */
export default function AlphaDescription(opportunity: AlphaOpportunityProps) {
  const components = {
    a: ({ ...props }) => (
      <a
        onClick={() => {
          try {
            // mixpanel.track(EventName.PageView, {
            //   pageName: PageName.Post,
            //   name: opportunity.homepageDescription,
            //   id: opportunity.id,
            //   alphaExternalURL: getHostname(props?.href ?? ''),
            //   ecosystem: [...(opportunity.ecosystemFilter ?? [])],
            //   categories: [...(opportunity.categoryFilter ?? [])],
            // })
          } catch (err) {
            // ignore
          }
        }}
        {...props}
        target='_blank'
        rel='noreferrer noopener'
        className='text-green-600 hover:text-green-500 no-underline transition-colors break-all'
        style={{ wordBreak: 'break-all' }}
      />
    ),
    hr: () => <Separator className='my-6' />,
  }

  return (
    <div className='rounded-xl prose-neutral prose prose-sm dark:prose-invert'>
      <Markdown remarkPlugins={remarkPlugins} components={components}>
        {opportunity.descriptionActions}
      </Markdown>
    </div>
  )
}

/**
 * renders the description for a Chad listing using markdown
 */
export function ChadDescription(raffle: RaffleListingProps) {
  const components = {
    a: ({ ...props }) => (
      <a
        onClick={() => {
          try {
            mixpanel.track(EventName.PageView, {
              pageName: PageName.ChadExclusivesDetail,
              name: raffle.title,
              id: raffle.id,
              raffleExternalURL: getHostname(props?.href ?? ''),
              ecosystem: [...(raffle?.categories ?? [])],
              categories: [...(raffle?.ecosystem ?? [])],
              isChad: true,
            })
          } catch (err) {
            // ignore
          }
        }}
        {...props}
        target='_blank'
        rel='noreferrer noopener'
        className='text-green-600 hover:text-green-500 no-underline transition-colors break-all'
        style={{ wordBreak: 'break-all' }}
      />
    ),
  }

  if (!raffle.description) {
    return null
  }

  return (
    <section className='rounded-xl prose-neutral prose prose-sm dark:prose-invert space-y-3'>
      <span className='text-[1.125rem] font-bold'>About</span>

      <Markdown remarkPlugins={remarkPlugins} components={components}>
        {raffle.description || ''}
      </Markdown>
    </section>
  )
}
