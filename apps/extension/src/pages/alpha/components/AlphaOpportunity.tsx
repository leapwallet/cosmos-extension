import { BookmarkSimple, CheckCircle, EyeSlash } from '@phosphor-icons/react'
import { EventName, PageName } from 'config/analytics'
import { AnimatePresence, motion } from 'framer-motion'
import { AlphaOpportunity as AlphaOpportunityType } from 'hooks/useAlphaOpportunities'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from 'utils/cn'
import { opacityFadeInOut } from 'utils/motion-variants'
import { mixpanelTrack } from 'utils/tracking'

import {
  alphaCardTransition,
  alphaCardVariants,
  animateBookMark,
  getBookMarkCloneId,
} from '../chad-components/RaffleListing'
import { useBookmarks } from '../context/bookmark-context'
import { useFilters } from '../context/filter-context'
import { getHostname } from '../utils'
import { ALPHA_BOOKMARK_ID } from '../utils/constants'
import { RaffleVisibilityStatus } from './alpha-timeline/use-raffle-status-map'
import ListingFooter from './ListingFooter'
import ListingImage from './ListingImage'
import Tags from './Tags'

export type AlphaOpportunityProps = AlphaOpportunityType & {
  isBookmarked: boolean
  pageName: PageName
  isSearched?: boolean
  onMarkRaffle?: (id: string, status: RaffleVisibilityStatus) => void
  visibilityStatus?: RaffleVisibilityStatus
}

const exitDurationInSec = 0.4
const exitVariants = {
  exitLeft: {
    x: '-100%',
    transition: {
      duration: exitDurationInSec,
      ease: 'easeInOut',
    },
  },
  exitRight: {
    x: '100%',
    transition: {
      duration: exitDurationInSec,
      ease: 'easeInOut',
    },
  },
}

export default function AlphaOpportunity(props: AlphaOpportunityProps) {
  const {
    additionDate,
    homepageDescription,
    ecosystemFilter,
    categoryFilter,
    descriptionActions,
    relevantLinks,
    endDate,
    image,
    id,
    isSearched,
    pageName,
    onMarkRaffle,
    visibilityStatus,
  } = props
  const { toggleBookmark, isBookmarked } = useBookmarks()
  const {
    setOpportunities,
    setEcosystems,
    selectedOpportunities,
    selectedEcosystems,
    openDetails,
  } = useFilters()

  const isDragging = useRef(false)
  const dragStartX = useRef<number | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const bookMarkIconRef = useRef<SVGSVGElement>(null)
  const bookMarkAnimationRef = useRef<Animation | null>(null)
  const [isExiting, setIsExiting] = useState(false)

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    const prevBookMarked = isBookmarked(id)
    const headerBookMarkIcon = document.getElementById(ALPHA_BOOKMARK_ID)

    if (!prevBookMarked && headerBookMarkIcon && bookMarkIconRef.current) {
      bookMarkAnimationRef.current = animateBookMark(
        id,
        headerBookMarkIcon,
        bookMarkIconRef.current,
      )
    }

    toggleBookmark(id)
    mixpanelTrack(EventName.Bookmark, {
      [!prevBookMarked ? 'bookmarkAdded' : 'bookmarkRemoved']: id,
      name: homepageDescription,
      page: PageName.Alpha,
    })
  }

  const handleClick = () => {
    if (isDragging.current) return

    // if the opportunity is a post, open the details page:
    if (descriptionActions && descriptionActions !== 'NA') {
      openDetails(props)

      // mixpanelTrack(EventName.PageView, {
      //   pageName: PageName.Post,
      //   name: homepageDescription,
      //   alphaSelectSource: isSearched ? 'Search Results' : 'Default List',
      //   id: id,
      //   ecosystem: [...(ecosystemFilter || [])],
      //   categories: [...(categoryFilter || [])],
      // })

      return
    }
    // if the opportunity only has an external link, open the link:
    if (relevantLinks?.[0]) {
      mixpanelTrack(EventName.PageView, {
        pageName: pageName,
        name: homepageDescription,
        alphaSelectSource: isSearched ? 'Search Results' : 'Default List',
        id: id,
        alphaExternalURL: getHostname(relevantLinks[0]),
        ecosystem: [...(ecosystemFilter || [])],
        categories: [...(categoryFilter || [])],
      })
      window.open(relevantLinks[0], '_blank', 'noopener,noreferrer')

      return
    }

    // else just register the click for the opportunity:
    mixpanelTrack(EventName.PageView, {
      pageName: pageName,
      name: homepageDescription,
      alphaSelectSource: isSearched ? 'Search Results' : 'Default List',
      id: id,
      ecosystem: [...(ecosystemFilter || [])],
      categories: [...(categoryFilter || [])],
    })
  }

  const handleEcosystemClick = useCallback(
    (ecosystem: string) => {
      setEcosystems([...(selectedEcosystems || []), ecosystem])
    },
    [selectedEcosystems, setEcosystems],
  )

  const handleCategoryClick = useCallback(
    (category: string) => {
      setOpportunities([...(selectedOpportunities || []), category])
    },
    [selectedOpportunities, setOpportunities],
  )

  // Swipe gesture logic
  const handleDragStart = (_: any, info: { point: { x: number } }) => {
    isDragging.current = true
    dragStartX.current = info.point.x
    setSwipeDirection(null)
  }

  const handleDrag = (_: any, info: { point: { x: number } }) => {
    if (dragStartX.current !== null) {
      const deltaX = info.point.x - dragStartX.current
      if (Math.abs(deltaX) > 10) {
        setSwipeDirection(deltaX > 0 ? 'right' : 'left')
      }
    }
  }

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    isDragging.current = false
    dragStartX.current = null

    let status: RaffleVisibilityStatus | null = null
    if (info.offset.x < -100) {
      // Swiped right: completed
      status = 'completed'
    } else if (info.offset.x > 100) {
      // Swiped left: hide
      status = 'hidden'
    }

    setIsExiting(!!status)
    setTimeout(() => {
      status && onMarkRaffle?.(id, status)
      setSwipeDirection(null)
    }, (exitDurationInSec - 0.05) * 1000) // exit bit faster than the animation
  }

  useEffect(() => {
    return () => {
      if (bookMarkAnimationRef.current) {
        bookMarkAnimationRef.current.cancel()
        document.getElementById(getBookMarkCloneId(id))?.remove()
      }
    }
  }, [id])

  const enableDrag = !!onMarkRaffle && !visibilityStatus

  return (
    <motion.div
      initial='initial'
      animate={'animate'}
      variants={alphaCardVariants}
      transition={alphaCardTransition}
      onClick={handleClick}
      className='relative isolate'
    >
      <motion.div
        variants={exitVariants}
        animate={isExiting ? (swipeDirection === 'left' ? 'exitLeft' : 'exitRight') : undefined}
        drag={enableDrag ? 'x' : undefined}
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className={cn(
          'cursor-pointer flex items-start p-5 transition-colors duration-200 ease-in-out gap-4 flex-col rounded-2xl border mb-4 border-secondary-300',
          visibilityStatus ? '' : 'gradient-linear-mono',
        )}
      >
        <div className='flex items-center gap-2 justify-between w-full'>
          <Tags
            visibilityStatus={visibilityStatus}
            ecosystemFilter={ecosystemFilter}
            categoryFilter={categoryFilter}
            handleEcosystemClick={handleEcosystemClick}
            handleCategoryClick={handleCategoryClick}
          />

          <button onClick={handleBookmarkClick}>
            <BookmarkSimple
              ref={bookMarkIconRef}
              weight={isBookmarked(id) ? 'fill' : 'regular'}
              className={cn('size-5', isBookmarked(id) ? 'text-primary' : 'text-foreground')}
            />
          </button>
        </div>

        <div className='flex items-start gap-2 justify-between w-full'>
          <div className='flex flex-col gap-1'>
            <span className='font-bold text-sm leading-snug'>{homepageDescription}</span>

            <ListingFooter
              endDate={endDate}
              additionDate={additionDate}
              relevantLinks={relevantLinks}
            />
          </div>

          <div className='size-12 rounded-lg bg-secondary overflow-hidden shrink-0'>
            <ListingImage
              ecosystemFilter={ecosystemFilter?.[0]}
              categoryFilter={categoryFilter?.[0]}
              image={image}
            />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {swipeDirection === 'right' ? (
          <motion.div
            key='right'
            variants={opacityFadeInOut}
            initial='hidden'
            animate='visible'
            exit='hidden'
            className='absolute inset-0 rounded-2xl bg-destructive-100 -z-10 select-none pointer-events-none flex items-center justify-start px-10'
          >
            <EyeSlash size={40} className='text-white' />
          </motion.div>
        ) : swipeDirection === 'left' ? (
          <motion.div
            key='left'
            variants={opacityFadeInOut}
            initial='hidden'
            animate='visible'
            exit='hidden'
            className='absolute inset-0 rounded-2xl bg-primary -z-10 select-none pointer-events-none flex items-center justify-end px-10'
          >
            <CheckCircle size={40} className='text-white' />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
