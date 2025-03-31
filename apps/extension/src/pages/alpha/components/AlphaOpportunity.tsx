import { ArrowSquareOut, BookmarkSimple, CaretRight } from '@phosphor-icons/react'
import classNames from 'classnames'
import Text from 'components/text'
import { EventName, PageName } from 'config/analytics'
import { motion } from 'framer-motion'
import { AlphaOpportunity as AlphaOpportunityType } from 'hooks/useAlphaOpportunities'
import mixpanel from 'mixpanel-browser'
import React, { useCallback, useEffect, useRef } from 'react'

import { useBookmarks } from '../context/bookmark-context'
import { useFilters } from '../context/filter-context'
import { getHostname } from '../utils'
import ListingFooter from './ListingFooter'
import ListingImage from './ListingImage'
import Tags from './Tags'

export type AlphaOpportunityProps = AlphaOpportunityType & {
  isBookmarked: boolean
  pageName: PageName
  isSearched?: boolean
}

const getBookMarkCloneId = (id: string) => `cloned-bookmark-icon-${id}`

const animateBookMark = (id: string, headerBookMarkIcon: HTMLElement, bookMarkIcon: SVGElement) => {
  // first clone the bookmark icon
  const clonedBookMarkIcon = headerBookMarkIcon.cloneNode(true) as HTMLElement
  clonedBookMarkIcon.id = getBookMarkCloneId(id)
  clonedBookMarkIcon.style.zIndex = '999'

  // add the cloned bookmark icon to body
  document.body.appendChild(clonedBookMarkIcon)

  const clickedIconClientRect = bookMarkIcon.getBoundingClientRect()

  // place the cloned bookmark icon at the original position of current bookmark icon
  clonedBookMarkIcon.style.position = 'fixed'
  clonedBookMarkIcon.style.left = `${clickedIconClientRect.left}px`
  clonedBookMarkIcon.style.top = `${clickedIconClientRect.top}px`

  // find the destination (headerBookMarkIcon) element position
  const destinationElementClientRect = headerBookMarkIcon.getBoundingClientRect()

  // animate the cloned bookmark icon to the destination element
  const animation = clonedBookMarkIcon.animate(
    [
      {
        top: `${clickedIconClientRect.top}px`,
        left: `${clickedIconClientRect.left}px`,
      },
      {
        top: `${destinationElementClientRect.top}px`,
        left: `${destinationElementClientRect.left}px`,
      },
    ],
    {
      duration: 750,
      easing: 'ease-in-out',
    },
  )

  animation.finished.then(() => {
    clonedBookMarkIcon.remove()
  })

  return animation
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
  } = props
  const { toggleBookmark, isBookmarked } = useBookmarks()
  const {
    setOpportunities,
    setEcosystems,
    selectedOpportunities,
    selectedEcosystems,
    openDetails,
  } = useFilters()

  const bookMarkIconRef = useRef<SVGSVGElement>(null)
  const bookMarkAnimationRef = useRef<Animation | null>(null)

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    const prevBookMarked = isBookmarked(id)
    const headerBookMarkIcon = document.getElementById('alpha-bookmark-icon')

    if (!prevBookMarked && headerBookMarkIcon && bookMarkIconRef.current) {
      bookMarkAnimationRef.current = animateBookMark(
        id,
        headerBookMarkIcon,
        bookMarkIconRef.current,
      )
    }

    try {
      toggleBookmark(id)
      mixpanel.track(EventName.Bookmark, {
        [!prevBookMarked ? 'bookmarkAdded' : 'bookmarkRemoved']: id,
      })
    } catch (err) {
      // ignore
    }
  }

  const handleClick = () => {
    try {
      // if the opportunity is a post, open the details page:
      if (descriptionActions && descriptionActions !== 'NA') {
        openDetails(props)

        mixpanel.track(EventName.PageView, {
          pageName: PageName.Post,
          name: homepageDescription,
          alphaSelectSource: isSearched ? 'Search Results' : 'Default List',
          id: id,
          alphaTag: [...(ecosystemFilter || []), ...(categoryFilter || [])],
        })
      }
      // if the opportunity only has an external link, open the link:
      else if (relevantLinks?.[0]) {
        mixpanel.track(EventName.PageView, {
          pageName: pageName,
          name: homepageDescription,
          alphaSelectSource: isSearched ? 'Search Results' : 'Default List',
          id: id,
          alphaExternalURL: getHostname(relevantLinks[0]),
          alphaTag: [...(ecosystemFilter || []), ...(categoryFilter || [])],
        })
        window.open(relevantLinks[0], '_blank', 'noopener,noreferrer')
      }
      // else just register the click for the opportunity:
      else {
        mixpanel.track(EventName.PageView, {
          pageName: pageName,
          name: homepageDescription,
          alphaSelectSource: isSearched ? 'Search Results' : 'Default List',
          id: id,
          alphaTag: [...(ecosystemFilter || []), ...(categoryFilter || [])],
        })
      }
    } catch (err) {
      // ignore
    }
  }

  const handleEcosystemClick = useCallback(
    (e: React.MouseEvent, ecosystem: string) => {
      e.stopPropagation()
      setEcosystems([...(selectedEcosystems || []), ecosystem])
    },
    [selectedEcosystems, setEcosystems],
  )

  const handleCategoryClick = useCallback(
    (e: React.MouseEvent, category: string) => {
      e.stopPropagation()
      setOpportunities([...(selectedOpportunities || []), category])
    },
    [selectedOpportunities, setOpportunities],
  )

  useEffect(() => {
    return () => {
      if (bookMarkAnimationRef.current) {
        bookMarkAnimationRef.current.cancel()
        document.getElementById(getBookMarkCloneId(id))?.remove()
      }
    }
  }, [id])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={handleClick}
      className={classNames(
        'flex items-start cursor-pointer gap-3 rounded-xl bg-white-100 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] px-4 border-gray-100 dark:border-[#2C2C2C] py-4 mb-4 transition-colors duration-200 ease-in-out',
      )}
    >
      <div className='w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 overflow-hidden shrink-0'>
        <ListingImage
          ecosystemFilter={ecosystemFilter?.[0]}
          categoryFilter={categoryFilter?.[0]}
          image={image}
        />
      </div>
      <div className='flex-1'>
        <div className='flex items-start justify-between gap-2'>
          <Text size='sm' className='font-medium mb-2 flex-1'>
            {homepageDescription}
          </Text>

          {descriptionActions && descriptionActions !== 'NA' ? (
            <button className='pt-1 flex-shrink-0'>
              <CaretRight className='w-3 h-3 text-gray-600 dark:text-gray-400' />
            </button>
          ) : relevantLinks?.[0] ? (
            <button className='flex-shrink-0'>
              <ArrowSquareOut className='w-4 h-4 text-gray-600 dark:text-gray-400' />
            </button>
          ) : null}
        </div>
        <div>
          <Tags
            ecosystemFilter={ecosystemFilter}
            categoryFilter={categoryFilter}
            handleEcosystemClick={handleEcosystemClick}
            handleCategoryClick={handleCategoryClick}
          />
        </div>
        <div className='w-full flex items-center justify-between gap-2 text-xs mt-3 pt-3 border-t border-gray-100 dark:border-[#2C2C2C]'>
          <ListingFooter
            endDate={endDate}
            additionDate={additionDate}
            relevantLinks={relevantLinks}
          />
          <button onClick={handleBookmarkClick}>
            <BookmarkSimple
              ref={bookMarkIconRef}
              weight={isBookmarked(id) ? 'fill' : 'regular'}
              className={classNames(
                'w-4 h-4',
                isBookmarked(id) ? 'text-green-600' : 'text-gray-600 dark:text-gray-400',
              )}
            />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
