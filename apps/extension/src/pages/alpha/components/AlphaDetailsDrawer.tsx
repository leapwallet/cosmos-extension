import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import { ArrowSquareOut, BookmarkSimple } from '@phosphor-icons/react'
import classNames from 'classnames'
import Text from 'components/text'
import { EventName, PageName } from 'config/analytics'
import { AnimatePresence, motion } from 'framer-motion'
import mixpanel from 'mixpanel-browser'
import React, { useCallback, useEffect, useRef } from 'react'

import { useBookmarks } from '../context/bookmark-context'
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
  const { toggleBookmark, isBookmarked } = useBookmarks()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleBookmarkClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      try {
        toggleBookmark(opportunity?.id ?? '')
        mixpanel.track(EventName.Bookmark, {
          [!isBookmarked(opportunity?.id ?? '') ? 'bookmarkAdded' : 'bookmarkRemoved']:
            opportunity?.id,
        })
      } catch (err) {
        // ignore
      }
    },
    [opportunity?.id, toggleBookmark, isBookmarked],
  )

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
    try {
      if (opportunity?.relevantLinks?.[0]) {
        mixpanel.track(EventName.PageView, {
          pageName: PageName.Post,
          name: opportunity?.homepageDescription,
          id: opportunity?.id,
          alphaExternalURL: getHostname(opportunity?.relevantLinks?.[0] ?? ''),
          alphaTag: [
            ...(opportunity?.ecosystemFilter ?? []),
            ...(opportunity?.categoryFilter ?? []),
          ],
        })
        window.open(opportunity?.relevantLinks?.[0] ?? '', '_blank', 'noopener,noreferrer')
      } else {
        mixpanel.track(EventName.PageView, {
          pageName: PageName.Post,
          name: opportunity?.homepageDescription,
          id: opportunity?.id,
          alphaTag: [
            ...(opportunity?.ecosystemFilter ?? []),
            ...(opportunity?.categoryFilter ?? []),
          ],
        })
      }
    } catch (err) {
      // ignore
    }
  }

  return (
    <>
      <AnimatePresence>
        {isShown && (
          <motion.div
            ref={containerRef}
            className='absolute right-0 top-0 enclosing-panel panel-width panel-height flex flex-col rounded-[10px] z-[1000] dark:bg-black-100 bg-gray-50'
            initial={{ x: 400, opacity: 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 1 }}
            transition={{
              duration: 0.5,
              ease: 'easeInOut',
            }}
          >
            <div className='sticky top-0 z-10 bg-inherit'>
              <Header title='Post' action={{ type: HeaderActionType.BACK, onClick: onClose }} />
            </div>
            <div className='flex-1 overflow-y-auto'>
              <div className='flex flex-col gap-4 p-7'>
                {/* Opportunity details section */}
                <div
                  onClick={handleExternalLinkClick}
                  className={classNames(
                    'flex items-start gap-3 rounded-xl bg-white-100 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] px-4 border-gray-100 dark:border-[#2C2C2C] py-4 transition-colors duration-200 ease-in-out',
                    {
                      'cursor-pointer': !!opportunity?.relevantLinks?.[0],
                    },
                  )}
                >
                  <div className='w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 overflow-hidden shrink-0'>
                    <ListingImage
                      ecosystemFilter={opportunity?.ecosystemFilter?.[0]}
                      categoryFilter={opportunity?.categoryFilter?.[0]}
                      image={opportunity?.image}
                    />
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-start justify-between gap-2'>
                      <Text size='sm' className='font-medium mb-2'>
                        {opportunity?.homepageDescription}
                      </Text>
                      {opportunity?.relevantLinks?.[0] ? (
                        <button className='flex-shrink-0'>
                          <ArrowSquareOut className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                        </button>
                      ) : null}
                    </div>
                    <Tags
                      ecosystemFilter={opportunity?.ecosystemFilter ?? []}
                      categoryFilter={opportunity?.categoryFilter ?? []}
                      handleEcosystemClick={(e) => {
                        e.stopPropagation()
                      }}
                      handleCategoryClick={(e) => {
                        e.stopPropagation()
                      }}
                    />

                    <div className='w-full flex items-center justify-between gap-2 text-xs mt-3 pt-3 border-t border-gray-100 dark:border-[#2C2C2C] text-xs'>
                      <ListingFooter
                        endDate={opportunity?.endDate}
                        additionDate={opportunity?.additionDate ?? ''}
                        relevantLinks={opportunity?.relevantLinks ?? []}
                      />
                      <button onClick={handleBookmarkClick} className='cursor-pointer'>
                        <BookmarkSimple
                          weight={isBookmarked(opportunity?.id ?? '') ? 'fill' : 'regular'}
                          className={classNames(
                            'w-4 h-4',
                            isBookmarked(opportunity?.id ?? '')
                              ? 'text-green-600'
                              : 'text-gray-600 dark:text-gray-400',
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description actions section */}
                {opportunity?.descriptionActions && opportunity?.descriptionActions !== 'NA' ? (
                  <AlphaDescription {...opportunity} pageName={PageName.Alpha} />
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
