import { BookmarkSimple, SealCheck } from '@phosphor-icons/react'
import { Button } from 'components/ui/button'
import { EventName, PageName } from 'config/analytics'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { Raffle as RaffleType, RaffleStatus } from 'hooks/useAlphaOpportunities'
import { useQueryParams } from 'hooks/useQuery'
import { ExternalLinkIcon } from 'icons/external-link'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { cn } from 'utils/cn'
import { queryParams } from 'utils/query-params'
import { mixpanelTrack } from 'utils/tracking'

import Tags from '../components/Tags'
import { useChadBookmarks } from '../context/bookmark-context'
import { useChadProvider } from '../context/chad-exclusives-context'
import { useFilters } from '../context/filter-context'
import { endsInUTC, startsInUTC } from '../utils'
import { ALPHA_BOOKMARK_CLONE_ID, ALPHA_BOOKMARK_ID } from '../utils/constants'
import ChadListingImage from './ChadListingImage'
import { StatusFilter } from './ChadTimeline/filters'

export type RaffleListingProps = RaffleType & {
  isBookmarked: boolean
  pageName: PageName
  isSearched?: boolean
  highlight?: boolean
  userWon?: boolean
  bannerImage?: string
}

export const getBookMarkCloneId = (id: string) => `cloned-bookmark-icon-${id}`

export const animateBookMark = (
  id: string,
  headerBookMarkIcon: HTMLElement,
  bookMarkIcon: SVGElement,
) => {
  // first clone the bookmark icon
  const clonedBookMarkIcon = document
    .getElementById(ALPHA_BOOKMARK_CLONE_ID)
    ?.cloneNode(true) as HTMLElement
  clonedBookMarkIcon.id = getBookMarkCloneId(id)
  clonedBookMarkIcon.style.zIndex = '999'
  clonedBookMarkIcon.style.display = 'block'

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
        left: `${clickedIconClientRect.left + 12}px`,
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

export const alphaCardVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

export const alphaCardTransition = {
  duration: 0.3,
  ease: 'easeOut',
}

export default function RaffleListing(props: RaffleListingProps) {
  const {
    title,
    startsAt,
    endsAt,
    status,
    ecosystem,
    categories,
    image,
    id,
    isSearched,
    highlight,
    userWon,
    redirectUrl,
  } = props
  const params = useQueryParams()
  const { toggleBookmark, isBookmarked } = useChadBookmarks()
  const {
    setOpportunities,
    setEcosystems,
    selectedOpportunities,
    selectedEcosystems,
    openDetails,
    alphaUser,
  } = useChadProvider()

  const {
    setOpportunities: setAllOpportunities,
    setEcosystems: setAllEcosystems,
    selectedOpportunities: selectedAllOpportunities,
    selectedEcosystems: selectedAllEcosystems,
  } = useFilters()

  const bookMarkIconRef = useRef<SVGSVGElement>(null)
  const bookMarkAnimationRef = useRef<Animation | null>(null)

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
      name: title,
      page: highlight ? PageName.Alpha : PageName.ChadExclusives,
      isChad: alphaUser?.isChad ?? false,
    })
  }

  const handleClick = () => {
    if (redirectUrl) {
      mixpanelTrack(EventName.PageView, {
        pageName: highlight ? PageName.Alpha : PageName.ChadExclusives,
        RaffleSelectSource: isSearched ? 'Search Results' : 'Default List',
        id: id,
        ChadEligibility: alphaUser?.isChad ? alphaUser.id : 'No',
        ecosystem: [...(ecosystem ?? [])],
        categories: [...(categories ?? [])],
        raffleExternalURL: redirectUrl,
        isChad: alphaUser?.isChad ?? false,
      })

      window.open(redirectUrl, '_blank')
      return
    }

    openDetails(props)
    mixpanelTrack(EventName.PageView, {
      pageName: highlight ? PageName.Alpha : PageName.ChadExclusives,
      RaffleSelectSource: isSearched ? 'Search Results' : 'Default List',
      id: id,
      ChadEligibility: alphaUser?.isChad ? alphaUser.id : 'No',
      ecosystem: [...(ecosystem ?? [])],
      categories: [...(categories ?? [])],
      isChad: alphaUser?.isChad ?? false,
    })
  }

  const handleEcosystemClick = useCallback(
    (ecosystem: string) => {
      if (highlight) {
        setAllEcosystems([...(selectedAllEcosystems || []), ecosystem])
      } else {
        setEcosystems([...(selectedEcosystems || []), ecosystem])
      }
    },
    [selectedEcosystems, setEcosystems, selectedAllEcosystems, setAllEcosystems, highlight],
  )

  const handleCategoryClick = useCallback(
    (category: string) => {
      if (highlight) {
        setAllOpportunities([...(selectedAllOpportunities || []), category])
      } else {
        setOpportunities([...(selectedOpportunities || []), category])
      }
    },
    [
      selectedOpportunities,
      setOpportunities,
      selectedAllOpportunities,
      setAllOpportunities,
      highlight,
    ],
  )

  const handleLiveClick = useCallback(() => {
    const status = params.get(queryParams.alphaDateStatus) as StatusFilter | null
    if (status === StatusFilter.Live) {
      params.remove(queryParams.alphaDateStatus)
    } else {
      params.set(queryParams.alphaDateStatus, StatusFilter.Live)
    }
  }, [params])

  useEffect(() => {
    return () => {
      if (bookMarkAnimationRef.current) {
        bookMarkAnimationRef.current.cancel()
        document.getElementById(getBookMarkCloneId(id))?.remove()
      }
    }
  }, [id])

  const diff = useMemo(() => {
    const daysjsStart = dayjs(startsAt)
    const now = dayjs()
    return now.diff(daysjsStart, 'second')
  }, [startsAt])

  const dateLabel = useMemo(() => {
    if (diff < 0) {
      return `Starts in ${startsInUTC(startsAt)}`
    }

    const endIn = endsInUTC(endsAt)
    if (status === RaffleStatus.COMPLETED || endIn === 'Ended') {
      return `Ended on ${dayjs(endsAt).format('MMM D, YYYY')}`
    }

    return endIn
  }, [diff, endsAt, status, startsAt])

  const isLive = useMemo(
    () =>
      Boolean(
        endsAt && diff >= 0 && status !== RaffleStatus.COMPLETED && endsInUTC(endsAt) !== 'Ended',
      ),
    [diff, endsAt, status],
  )

  const isEnded = useMemo(
    () => status === RaffleStatus.COMPLETED || endsInUTC(endsAt) === 'Ended',
    [endsAt, status],
  )

  return (
    <motion.div
      initial='initial'
      animate='animate'
      variants={alphaCardVariants}
      transition={alphaCardTransition}
      onClick={handleClick}
      className={cn(
        'flex items-start cursor-pointer p-5 transition-colors duration-200 ease-in-out gap-4 flex-col rounded-2xl border mb-4 border-secondary-300',
        isEnded ? 'bg-secondary' : 'gradient-linear-mono',
      )}
    >
      <Tags
        isLive={isLive}
        ecosystemFilter={ecosystem ?? []}
        categoryFilter={categories ?? []}
        handleEcosystemClick={handleEcosystemClick}
        handleCategoryClick={handleCategoryClick}
        handleLiveClick={handleLiveClick}
      />

      <div className='flex items-center gap-4 justify-between w-full'>
        <div className='flex flex-col gap-1'>
          <span className='font-bold leading-snug'>{title}</span>
          <span className='text-secondary-800 text-sm'>{dateLabel}</span>
        </div>

        <div className='size-16 rounded-lg bg-secondary overflow-hidden shrink-0'>
          <ChadListingImage image={image} alt={title} />
        </div>
      </div>

      <div className='flex items-center justify-between gap-2 w-full'>
        <Button size={'sm'} className='text-xs h-8 w-[9.375rem] gap-1' variant={'mono'}>
          {isLive ? <>Enter now</> : <>Check details</>}
          {!!redirectUrl && <ExternalLinkIcon className='size-3' />}
        </Button>

        {userWon ? (
          <div className='flex items-center gap-1 text-accent-success py-1.5 pl-4 pr-5 rounded-l-full bg-accent-foreground/10 font-bold -mr-5'>
            <SealCheck weight='fill' height={16} width={16} />
            <span className='text-xs'>You won</span>
          </div>
        ) : (
          <button onClick={handleBookmarkClick}>
            <BookmarkSimple
              ref={bookMarkIconRef}
              weight={isBookmarked(id) ? 'fill' : 'regular'}
              className={cn(
                'size-6',
                isBookmarked(id) ? 'text-primary' : 'text- dark:text-gray-400',
              )}
            />
          </button>
        )}
      </div>
    </motion.div>
  )
}
