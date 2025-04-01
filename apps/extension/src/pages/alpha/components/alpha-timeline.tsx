import { useDebounce } from '@leapwallet/cosmos-wallet-hooks'
import { SearchInput } from 'components/search-input'
import { EventName, PageName } from 'config/analytics'
import { motion } from 'framer-motion'
import Fuse from 'fuse.js'
import { useAlphaOpportunities } from 'hooks/useAlphaOpportunities'
import { AlphaOpportunity as AlphaOpportunityType } from 'hooks/useAlphaOpportunities'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import { unreadAlphaStore } from '../../../stores/unread-alpha-store'
import { useBookmarks } from '../context/bookmark-context'
import { useFilters } from '../context/filter-context'
import { sortOpportunitiesByDate } from '../utils'
import AlphaOpportunity from './AlphaOpportunity'
import { AlphaSkeletonList } from './AlphaSkeleton'
import EmptyBookmarks from './EmptyBookmarks'
import FilterButton from './FilterButton'
import FilterDrawer from './FilterDrawer'
import { NoFilterResult, NoSearchResult } from './NoResultStates'
import SelectedFilterTags from './SelectedFilterTags'

export type AlphaOpportunityProps = AlphaOpportunityType & {
  isBookmarked: boolean
}

export function VirtualizationFooter() {
  return <div style={{ padding: '1rem', textAlign: 'center' }}> </div>
}

export default observer(function AlphaTimeline() {
  const { opportunities, isLoading } = useAlphaOpportunities()
  const [searchedTerm, setSearchedTerm] = useState('')
  const { selectedOpportunities, selectedEcosystems } = useFilters()
  const debouncedSearchTerm = useDebounce(searchedTerm, 1000)
  const { bookmarks } = useBookmarks()

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [customScrollParent, setCustomScrollParent] = useState<HTMLDivElement | null>(null)
  const virtuosoRef = useRef<VirtuosoHandle>(null)

  const fuse = useMemo(() => {
    return new Fuse(opportunities, {
      keys: ['homepageDescription', 'categoryFilter', 'ecosystemFilter'],
      threshold: 0.3,
      shouldSort: true,
    })
  }, [opportunities])

  const searchedOpportunities = useMemo(() => {
    if (!searchedTerm) {
      return sortOpportunitiesByDate(opportunities)
    }

    const results = fuse.search(searchedTerm)
    return sortOpportunitiesByDate(results.map((result) => result.item))
  }, [opportunities, searchedTerm, fuse])

  const filteredOpportunities = useMemo(() => {
    if (!selectedOpportunities?.length && !selectedEcosystems?.length) return searchedOpportunities

    return searchedOpportunities.filter((opportunity) => {
      return (
        (!selectedOpportunities?.length ||
          selectedOpportunities.every((category) =>
            opportunity.categoryFilter.includes(category),
          )) &&
        (!selectedEcosystems?.length ||
          selectedEcosystems.every((ecosystem) => opportunity.ecosystemFilter.includes(ecosystem)))
      )
    })
  }, [searchedOpportunities, selectedOpportunities, selectedEcosystems])

  /**
   * only having debouncedSearchTerm as dependency is intentional
   * to avoid tracking unecessary changes
   */
  useEffect(() => {
    try {
      if (debouncedSearchTerm) {
        mixpanel.track(EventName.SearchDone, {
          searchTerm: debouncedSearchTerm,
          searchResultsCount: filteredOpportunities.length,
          topResults: filteredOpportunities.slice(0, 5).map((opportunity) => opportunity.id),
        })
      }
    } catch (err) {
      // ignore
    }
  }, [debouncedSearchTerm])

  useEffect(() => {
    if (opportunities.length) {
      const allOpportunityIds = opportunities.map((opp) => opp.id).filter(Boolean) as string[]
      unreadAlphaStore.markAsRead(allOpportunityIds)
    }
  }, [opportunities])

  // no opportunities found state:
  if (opportunities.length < 1 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className='p-7'
      >
        <EmptyBookmarks
          title='No Alpha Opportunities'
          subTitle={<>Check back later for new alpha opportunities</>}
        />
      </motion.div>
    )
  }

  const filterCount = selectedEcosystems?.length + selectedOpportunities?.length

  // main state when opportunities exist:
  return (
    <>
      <div
        className='flex flex-col gap-4 h-full overflow-y-auto p-7 mb-4'
        ref={setCustomScrollParent}
      >
        {/* Search & Filter */}
        <div className='flex gap-2 items-center'>
          <SearchInput
            divClassName='flex w-full bg-white-100 dark:bg-gray-950 rounded-full py-2 pl-5 pr-[10px] focus-within:border-green-600'
            value={searchedTerm}
            onChange={(e) => setSearchedTerm(e.target.value)}
            placeholder='Search...'
            onClear={() => setSearchedTerm('')}
          />
          <FilterButton setIsFilterDrawerOpen={setIsFilterDrawerOpen} filterCount={filterCount} />
        </div>

        {/* Showing Filters */}
        {selectedOpportunities.length > 0 || selectedEcosystems.length > 0 ? (
          <SelectedFilterTags />
        ) : null}

        {/* No results state */}
        {filteredOpportunities.length === 0 && !isLoading && searchedTerm ? (
          <NoSearchResult />
        ) : filteredOpportunities.length === 0 && !isLoading ? (
          <NoFilterResult />
        ) : null}
        {/* Virtualized Alpha Opportunities */}
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
                  <AlphaOpportunity
                    key={`${opportunity.id}-${index}`}
                    {...opportunity}
                    pageName={PageName.Alpha}
                    isSearched={searchedTerm !== ''}
                    isBookmarked={bookmarks.has(opportunity.id ?? '')}
                  />
                )
              }}
            />
          </div>
        )}
        {/* Loading state */}
        {isLoading && (
          <div className='space-y-4'>
            <AlphaSkeletonList />
          </div>
        )}
        <FilterDrawer
          opportunities={opportunities}
          isShown={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          pageName={PageName.Alpha}
        />
      </div>
    </>
  )
})
