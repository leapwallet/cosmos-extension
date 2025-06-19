import BottomModal from 'components/new-bottom-modal'
import { PageName } from 'config/analytics'
import Fuse from 'fuse.js'
import { usePageView } from 'hooks/analytics/usePageView'
import {
  AlphaOpportunity as AlphaOpportunityType,
  Raffle,
  useAlphaOpportunities,
  useRaffles,
  useRaffleWins,
} from 'hooks/useAlphaOpportunities'
import React, { useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'

import RaffleListing from '../chad-components/RaffleListing'
import { useBookmarks, useChadBookmarks } from '../context/bookmark-context'
import { useChadProvider } from '../context/chad-exclusives-context'
import { useFilters } from '../context/filter-context'
import { formatRaffleDate, sortOpportunitiesByDate } from '../utils'
import { VirtualizationFooter } from './alpha-timeline'
import { AlphaTimelineFilters } from './alpha-timeline/filters'
import AlphaOpportunity from './AlphaOpportunity'
import EmptyBookmarks from './EmptyBookmarks'
import { FilterDrawer } from './FilterDrawer'
import { NoFilterResult } from './NoResultStates'
import SelectedFilterTags from './SelectedFilterTags'

type BookmarkedAlphaProps = {
  isOpen: boolean
  toggler: () => void
}

type TimelineItem = {
  id: string
  additionDate: string
  categoryFilter: string[]
  ecosystemFilter: string[]
  type: 'opportunity' | 'raffle'
  data: AlphaOpportunityType | Raffle
}

export const BookmarkedAlpha: React.FC<BookmarkedAlphaProps> = ({ isOpen, toggler }) => {
  const { opportunities, isLoading: isOpportunitiesLoading } = useAlphaOpportunities()
  const { raffles, isLoading: isRafflesLoading } = useRaffles()
  const { alphaUser } = useChadProvider()
  usePageView(PageName.Bookmark, isOpen, {
    isChad: alphaUser?.isChad ?? false,
  })
  const { raffleWins } = useRaffleWins(alphaUser?.id ?? '')
  const isLoading = isOpportunitiesLoading || isRafflesLoading
  const { bookmarks: alphaBookmarks } = useBookmarks()
  const { bookmarks: chadBookmarks } = useChadBookmarks()

  const bookmarks = useMemo(
    () => new Set([...alphaBookmarks, ...chadBookmarks]),
    [alphaBookmarks, chadBookmarks],
  )

  const { selectedOpportunities, selectedEcosystems } = useFilters()

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [searchedTerm, setSearchedTerm] = useState('')
  const [customScrollParent, setCustomScrollParent] = useState<HTMLDivElement | null>(null)

  // combined alpha listing and raffles:
  const allItems = useMemo<TimelineItem[]>(() => {
    const combined = [
      ...opportunities.map((opp) => ({
        id: opp.id,
        additionDate: opp.additionDate,
        categoryFilter: opp.categoryFilter,
        ecosystemFilter: opp.ecosystemFilter,
        type: 'opportunity' as const,
        data: opp,
      })),
      ...raffles.map((raffle) => ({
        id: raffle.id,
        additionDate: formatRaffleDate(raffle.createdAt),
        categoryFilter: raffle.categories ?? [],
        ecosystemFilter: raffle.ecosystem ?? [],
        type: 'raffle' as const,
        data: raffle,
      })),
    ]
    return sortOpportunitiesByDate(combined)
  }, [opportunities, raffles])

  /**
   * @description filtering items according to search query
   */
  const fuse = useMemo(() => {
    return new Fuse(allItems, {
      keys: [
        'data.homepageDescription',
        'data.title',
        'data.description',
        'categoryFilter',
        'ecosystemFilter',
      ],
      threshold: 0.3,
      shouldSort: true,
    })
  }, [allItems])

  const searchedItems = useMemo(() => {
    if (!searchedTerm) {
      return allItems
    }

    const results = fuse.search(searchedTerm)
    return sortOpportunitiesByDate(results.map((result) => result.item))
  }, [allItems, searchedTerm, fuse])

  /**
   * @description filtering items according to category and ecosystem filters
   */
  const filteredItems = useMemo(() => {
    const filteredList = searchedItems.filter((item) => bookmarks.has(item.id ?? ''))

    if (!selectedOpportunities?.length && !selectedEcosystems?.length) return filteredList

    return filteredList.filter((item) => {
      return (
        (!selectedOpportunities?.length ||
          selectedOpportunities.every((category) => item.categoryFilter.includes(category))) &&
        (!selectedEcosystems?.length ||
          selectedEcosystems.every((ecosystem) => item.ecosystemFilter.includes(ecosystem)))
      )
    })
  }, [searchedItems, selectedOpportunities, selectedEcosystems, bookmarks])

  const filterCount = selectedEcosystems?.length + selectedOpportunities?.length

  return (
    <BottomModal fullScreen isOpen={isOpen} onClose={toggler} title='Bookmarks' className='flex-1'>
      {filteredItems.length === 0 && filterCount === 0 && !isLoading && !searchedTerm ? (
        <EmptyBookmarks
          title='No Bookmarks Found'
          subTitle='Try looking at some listings and saving them'
          className='h-full'
        />
      ) : (
        <div className='flex flex-col gap-4 h-full' ref={setCustomScrollParent}>
          <AlphaTimelineFilters
            setSearchedTerm={setSearchedTerm}
            setIsFilterDrawerOpen={setIsFilterDrawerOpen}
          />

          {/* Showing Filters */}
          {selectedOpportunities.length > 0 || selectedEcosystems.length > 0 ? (
            <SelectedFilterTags />
          ) : null}

          {/* No results state */}
          {filteredItems.length === 0 && !isLoading && (
            <NoFilterResult
              className='mt-3 h-full flex-1'
              filterType={searchedTerm ? 'search' : 'no-results'}
            />
          )}

          {/* Virtualized Items */}
          {filteredItems.length > 0 ? (
            <div className='h-full flex flex-col flex-1'>
              <Virtuoso
                components={{ Footer: VirtualizationFooter }}
                customScrollParent={customScrollParent ?? undefined}
                style={{ height: '100%' }}
                totalCount={filteredItems.length}
                itemContent={(index) => {
                  const item = filteredItems[index]
                  if (item.type === 'opportunity') {
                    return (
                      <AlphaOpportunity
                        key={`${item.id}-${index}`}
                        {...(item.data as AlphaOpportunityType)}
                        pageName={PageName.Bookmark}
                        isBookmarked={bookmarks.has(item.id ?? '')}
                      />
                    )
                  } else {
                    return (
                      <RaffleListing
                        highlight={true}
                        key={`${item.id}-${index}`}
                        {...(item.data as Raffle)}
                        pageName={PageName.Bookmark}
                        isBookmarked={bookmarks.has(item.id ?? '')}
                        userWon={!!raffleWins?.find((win) => win.id === item.id)}
                      />
                    )
                  }
                }}
              />
            </div>
          ) : isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white-100'></div>
            </div>
          ) : null}

          <FilterDrawer
            opportunities={opportunities}
            isShown={isFilterDrawerOpen}
            onClose={() => setIsFilterDrawerOpen(false)}
            pageName={PageName.Bookmark}
          />
        </div>
      )}
    </BottomModal>
  )
}
