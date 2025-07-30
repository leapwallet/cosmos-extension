import { useDebounce } from '@leapwallet/cosmos-wallet-hooks'
import { X } from '@phosphor-icons/react'
import Text from 'components/text'
import { Separator } from 'components/ui/separator'
import { EventName, PageName } from 'config/analytics'
import dayjs from 'dayjs'
import { AnimatePresence, motion } from 'framer-motion'
import Fuse from 'fuse.js'
import { usePageView } from 'hooks/analytics/usePageView'
import {
  AlphaOpportunity as AlphaOpportunityType,
  RaffleStatus,
  useRaffles,
  useRaffleWins,
} from 'hooks/useAlphaOpportunities'
import { useQueryParams } from 'hooks/useQuery'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { oneTimePageViewStore } from 'stores/home-pageview-store'
import { queryParams } from 'utils/query-params'
import { mixpanelTrack } from 'utils/tracking'

import { AlphaSkeletonList } from '../../components/AlphaSkeleton'
import EmptyBookmarks from '../../components/EmptyBookmarks'
import { NoFilterResult } from '../../components/NoResultStates'
import { SelectedChadFilterTags } from '../../components/SelectedFilterTags'
import { useBookmarks } from '../../context/bookmark-context'
import { useChadProvider } from '../../context/chad-exclusives-context'
import { endsInUTC, sortRafflesByStatus } from '../../utils'
import { YouAreNotChadBanner } from '../Banners'
import ChadFilterDrawer from '../ChadFilterDrawer'
import RaffleListing from '../RaffleListing'
import { ChadExclusivesFilters, StatusFilter } from './filters'
import { ChadExclusivesHeader } from './header'

export type AlphaOpportunityProps = AlphaOpportunityType & {
  isBookmarked: boolean
}

export function VirtualizationFooter() {
  return <div style={{ padding: '2rem', textAlign: 'center' }}> </div>
}

export default observer(function ChadTimeline() {
  const { raffles, isLoading } = useRaffles()
  const { selectedOpportunities, selectedEcosystems, alphaUser, openDetails } = useChadProvider()
  const { bookmarks } = useBookmarks()
  const { raffleWins } = useRaffleWins(alphaUser?.id ?? '')
  const params = useQueryParams()

  const status = params.get(queryParams.alphaDateStatus) as StatusFilter | null

  const [searchedTerm, setSearchedTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchedTerm, 1000)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [customScrollParent, setCustomScrollParent] = useState<HTMLDivElement | null>(null)
  const virtuosoRef = useRef<VirtuosoHandle>(null)

  usePageView(
    PageName.ChadExclusives,
    !oneTimePageViewStore.hasSeenChadExclusives,
    {
      isChad: alphaUser?.isChad ?? false,
    },
    () => {
      oneTimePageViewStore.updateSeenChadExclusives(true)
    },
  )

  useEffect(() => {
    if (toast) {
      setTimeout(() => setToast(''), 2000)
    }
  }, [toast])

  // Deeplink support for Raffle Listing
  useEffect(() => {
    const listingId = params.get('listingId')
    if (listingId && raffles.length > 0) {
      const raffle = raffles.find((r) => r.id === listingId)
      if (raffle) {
        openDetails({
          ...raffle,
          isBookmarked: bookmarks.has(raffle.id),
          pageName: PageName.ChadExclusives,
          userWon: !!raffleWins?.find((win) => win.id === raffle.id),
        })
      }
    }
  }, [params, openDetails, raffles, isFilterDrawerOpen, bookmarks, raffleWins])

  const fuse = useMemo(() => {
    return new Fuse(raffles, {
      keys: ['title', 'secondaryTitle', 'ecosystem', 'categories'],
      threshold: 0.3,
      shouldSort: true,
    })
  }, [raffles])

  const searchedOpportunities = useMemo(() => {
    if (!searchedTerm) {
      return sortRafflesByStatus(raffles)
    }

    const results = fuse.search(searchedTerm)
    return sortRafflesByStatus(results.map((result) => result.item))
  }, [raffles, searchedTerm, fuse])

  const filteredOpportunities = useMemo(() => {
    if (!selectedOpportunities?.length && !selectedEcosystems?.length && !status) {
      return searchedOpportunities
    }

    const dateFilteredOpportunities = status
      ? searchedOpportunities.filter((opportunity) => {
          const startDate = dayjs(opportunity.startsAt)
          const endDate = dayjs(opportunity.endsAt)

          const now = dayjs()
          const diff = now.diff(startDate, 'second')

          if (status === StatusFilter.Live) {
            return (
              opportunity.endsAt &&
              diff >= 0 &&
              opportunity.status !== RaffleStatus.COMPLETED &&
              endsInUTC(opportunity.endsAt) !== 'Ended'
            )
          }

          if (status === StatusFilter.Upcoming) {
            return startDate.isAfter(now)
          }

          if (status === StatusFilter.Ended) {
            return endDate.isBefore(now)
          }
        })
      : searchedOpportunities

    return dateFilteredOpportunities.filter((opportunity) => {
      return (
        (!selectedOpportunities?.length ||
          selectedOpportunities.every((category) => opportunity?.categories?.includes(category))) &&
        (!selectedEcosystems?.length ||
          selectedEcosystems.every((ecosystem) => opportunity?.ecosystem?.includes(ecosystem)))
      )
    })
  }, [selectedOpportunities, selectedEcosystems, status, searchedOpportunities])

  /**
   * only having debouncedSearchTerm as dependency is intentional
   * to avoid tracking unnecessary changes
   */
  useEffect(() => {
    if (debouncedSearchTerm) {
      mixpanelTrack(EventName.SearchDone, {
        searchTerm: debouncedSearchTerm,
        searchResultsCount: filteredOpportunities.length,
        topResults: filteredOpportunities.slice(0, 5).map((opportunity) => opportunity.id),
        page: PageName.ChadExclusives,
        isChad: alphaUser?.isChad ?? false,
      })
    }
  }, [debouncedSearchTerm])

  const noResultsType = useMemo(() => {
    if (searchedTerm) return 'search'

    if (status) return status

    return 'no-results'
  }, [searchedTerm, status])

  // no opportunities found state:
  if (raffles.length < 1 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className='p-7'
      >
        <EmptyBookmarks
          title='No Opportunities'
          subTitle={<>Check back later for new exclusive opportunities</>}
        />
      </motion.div>
    )
  }

  return (
    <div
      className='flex flex-col h-full overflow-y-auto px-6 py-7 mb-4'
      ref={setCustomScrollParent}
    >
      {!alphaUser?.isChad && <YouAreNotChadBanner />}

      <ChadExclusivesHeader
        className={alphaUser?.isChad ? '' : 'mt-8'}
        isChad={alphaUser?.isChad ?? false}
      />

      <Separator className='my-7' />

      <ChadExclusivesFilters
        className='mb-7'
        setSearch={setSearchedTerm}
        setIsFilterDrawerOpen={setIsFilterDrawerOpen}
      />

      <AnimatePresence>
        {/* Showing Filters */}
        {selectedOpportunities.length > 0 || selectedEcosystems.length > 0 ? (
          <SelectedChadFilterTags />
        ) : null}

        {/* No results state */}
        {filteredOpportunities.length === 0 && !isLoading && (
          <NoFilterResult filterType={noResultsType} className='mb-9' />
        )}

        {/* Virtualized Raffle Listings */}
        {filteredOpportunities.length > 0 && (
          <div className='h-full flex flex-col flex-1'>
            <Virtuoso
              ref={virtuosoRef}
              components={{ Footer: VirtualizationFooter }}
              customScrollParent={customScrollParent ?? undefined}
              style={{ height: '100%' }}
              totalCount={filteredOpportunities.length}
              itemContent={(index) => {
                const opportunity = filteredOpportunities[index]
                return (
                  <RaffleListing
                    key={`${opportunity.id}-${index}`}
                    {...opportunity}
                    pageName={PageName.ChadExclusives}
                    isSearched={searchedTerm !== ''}
                    isBookmarked={bookmarks.has(opportunity.id ?? '')}
                    userWon={!!raffleWins?.find((win) => win.id === opportunity.id)}
                  />
                )
              }}
            />
          </div>
        )}
        {isLoading && (
          <div className='space-y-4'>
            <AlphaSkeletonList />
          </div>
        )}

        <ChadFilterDrawer
          isChad={alphaUser?.isChad ?? false}
          raffles={raffles}
          isShown={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          pageName={PageName.ChadExclusives}
        />
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className='sticky bottom-3 bg-green-600 dark:bg-green-600 rounded-full py-2.5 pr-[14px] pl-3 w-full flex items-center justify-between'
          >
            <Text size='xs' className='font-bold text-gray-900 dark:text-white-100'>
              {toast}
            </Text>
            <X
              size={12}
              onClick={() => setToast('')}
              className='cursor-pointer text-gray-900 dark:text-white-100 ml-2'
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
