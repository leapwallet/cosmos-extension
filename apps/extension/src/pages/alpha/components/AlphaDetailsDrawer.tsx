import classNames from 'classnames'
import BottomModal from 'components/new-bottom-modal'
import { Separator } from 'components/ui/separator'
import { EventName, PageName } from 'config/analytics'
import React, { useEffect, useRef } from 'react'
import { mixpanelTrack } from 'utils/tracking'

import { getHostname } from '../utils'
import { AlphaOpportunityProps } from './alpha-timeline'
import AlphaDescription from './AlphaDescription'
import ListingFooter from './ListingFooter'
import ListingImage from './ListingImage'
import Tags from './Tags'

type AlphaDetailsDrawerProps = {
  isShown: boolean
  onClose: () => void
  opportunity: AlphaOpportunityProps | null
}

export default function AlphaDetailsDrawer({
  isShown,
  onClose,
  opportunity,
}: AlphaDetailsDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.height = '100%'
      const parentElement = containerRef.current.parentElement
      if (parentElement) {
        if (isShown) {
          parentElement.style.overflow = 'hidden'
        } else {
          parentElement.style.overflow = 'auto'
        }
      }
    }
  }, [isShown])

  const handleExternalLinkClick = () => {
    const alphaExternalURL = opportunity?.relevantLinks?.[0]

    // mixpanelTrack(EventName.PageView, {
    //   pageName: PageName.Post,
    //   name: opportunity?.homepageDescription,
    //   id: opportunity?.id,
    //   alphaExternalURL: alphaExternalURL ? getHostname(alphaExternalURL ?? '') : undefined,
    //   ecosystem: [...(opportunity?.ecosystemFilter ?? [])],
    //   categories: [...(opportunity?.categoryFilter ?? [])],
    // })

    if (alphaExternalURL) {
      window.open(alphaExternalURL ?? '', '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <BottomModal
      fullScreen
      isOpen={isShown}
      onClose={onClose}
      title='Post'
      className='flex flex-col gap-4 p-6 pt-7 mb-4'
    >
      {/* Opportunity details section */}
      <div
        onClick={handleExternalLinkClick}
        className={classNames('flex items-start gap-6', {
          'cursor-pointer': !!opportunity?.relevantLinks?.[0],
        })}
      >
        <header>
          <Tags
            visibilityStatus={opportunity?.visibilityStatus}
            ecosystemFilter={opportunity?.ecosystemFilter ?? []}
            categoryFilter={opportunity?.categoryFilter ?? []}
          />

          <p className='text-xl font-bold mt-3 mb-2'>{opportunity?.homepageDescription}</p>

          <ListingFooter
            endDate={opportunity?.endDate}
            additionDate={opportunity?.additionDate ?? ''}
            relevantLinks={opportunity?.relevantLinks ?? []}
          />
        </header>

        <div className='size-12 rounded-lg overflow-hidden shrink-0'>
          <ListingImage
            ecosystemFilter={opportunity?.ecosystemFilter?.[0]}
            categoryFilter={opportunity?.categoryFilter?.[0]}
            image={opportunity?.image}
          />
        </div>
      </div>

      <Separator className='my-2' />

      {/* Description actions section */}
      {opportunity?.descriptionActions && opportunity?.descriptionActions !== 'NA' ? (
        <AlphaDescription {...opportunity} pageName={PageName.Alpha} />
      ) : null}
    </BottomModal>
  )
}
