import { useTheme } from '@leapwallet/leap-ui'
import BottomModal from 'components/new-bottom-modal'
import { PageName } from 'config/analytics'
import Fuse from 'fuse.js'
import { usePageView } from 'hooks/analytics/usePageView'
import { useRaffles, useRaffleWins } from 'hooks/useAlphaOpportunities'
import React, { useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'

import { AlphaSkeletonList } from '../components/AlphaSkeleton'
import EmptyBookmarks from '../components/EmptyBookmarks'
import { NoFilterResult } from '../components/NoResultStates'
import { SelectedChadFilterTags } from '../components/SelectedFilterTags'
import { useChadBookmarks } from '../context/bookmark-context'
import { useChadProvider } from '../context/chad-exclusives-context'
import { sortRafflesByStatus } from '../utils'
import ChadFilterDrawer from './ChadFilterDrawer'
import { ChadExclusivesFilters } from './ChadTimeline/filters'
import RaffleListing from './RaffleListing'

type BookmarkedChadProps = {
  isOpen: boolean
  toggler: () => void
}

export function BookmarkVirtualizationFooter() {
  return <div style={{ padding: '3rem', textAlign: 'center' }}> </div>
}

export const BookmarkedChad: React.FC<BookmarkedChadProps> = ({ isOpen, toggler }) => {
  const { raffles, isLoading } = useRaffles()
  const { bookmarks } = useChadBookmarks()
  const { alphaUser, selectedOpportunities, selectedEcosystems } = useChadProvider()
  usePageView(PageName.ChadExclusivesBookmark, isOpen, {
    isChad: alphaUser?.isChad ?? false,
  })
  const { raffleWins } = useRaffleWins(alphaUser?.id ?? '')
  const { theme } = useTheme()

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [searchedTerm, setSearchedTerm] = useState('')
  const [customScrollParent, setCustomScrollParent] = useState<HTMLDivElement | null>(null)

  /**
   * @description filtering raffles according to search query
   */
  const fuse = useMemo(() => {
    return new Fuse(raffles, {
      keys: ['title', 'secondaryTitle', 'ecosystem', 'categories'],
      threshold: 0.3,
      shouldSort: true,
    })
  }, [raffles])

  const searchedRaffles = useMemo(() => {
    if (!searchedTerm) {
      return sortRafflesByStatus(raffles)
    }

    const results = fuse.search(searchedTerm)
    return sortRafflesByStatus(results.map((result) => result.item))
  }, [raffles, searchedTerm, fuse])

  /**
   * @description filtering raffles according to category and ecosystem filters
   */
  const filteredRaffles = useMemo(() => {
    const filteredList = searchedRaffles.filter((raffle) => bookmarks.has(raffle.id ?? ''))

    if (!selectedOpportunities?.length && !selectedEcosystems?.length) return filteredList

    return filteredList.filter((raffle) => {
      return (
        (!selectedOpportunities?.length ||
          selectedOpportunities.every((category) => raffle.categories?.includes(category))) &&
        (!selectedEcosystems?.length ||
          selectedEcosystems.every((ecosystem) => raffle.ecosystem?.includes(ecosystem)))
      )
    })
  }, [searchedRaffles, selectedOpportunities, selectedEcosystems, bookmarks])

  const filterCount = selectedEcosystems?.length + selectedOpportunities?.length

  return (
    <BottomModal fullScreen isOpen={isOpen} onClose={toggler} title='Bookmarks' className='flex-1'>
      {filteredRaffles.length === 0 && filterCount === 0 && !isLoading && !searchedTerm ? (
        <EmptyBookmarks
          title='No Bookmarks Found'
          subTitle='Try looking at some exclusive opportunities and saving them'
          className='h-full'
        />
      ) : (
        <div className='flex flex-col gap-4 h-full' ref={setCustomScrollParent}>
          <ChadExclusivesFilters
            setIsFilterDrawerOpen={setIsFilterDrawerOpen}
            setSearch={setSearchedTerm}
          />

          {/* Showing Filters */}
          {selectedOpportunities.length > 0 || selectedEcosystems.length > 0 ? (
            <SelectedChadFilterTags />
          ) : null}

          {/* No results state */}
          {filteredRaffles.length === 0 && !isLoading && (
            <NoFilterResult
              className='mt-3 flex-1 h-full'
              filterType={searchedTerm ? 'search' : 'no-results'}
            />
          )}

          {/* Virtualized Raffle Listings */}
          {filteredRaffles.length > 0 ? (
            <div className='h-full flex flex-col flex-1'>
              <Virtuoso
                components={{ Footer: BookmarkVirtualizationFooter }}
                customScrollParent={customScrollParent ?? undefined}
                style={{ height: '100%' }}
                totalCount={filteredRaffles.length}
                itemContent={(index) => {
                  const raffle = filteredRaffles[index]
                  return (
                    <RaffleListing
                      key={`${raffle.id}-${index}`}
                      {...raffle}
                      pageName={PageName.Bookmark}
                      isSearched={searchedTerm !== ''}
                      isBookmarked={bookmarks.has(raffle.id ?? '')}
                      userWon={!!raffleWins?.find((win) => win.id === raffle.id)}
                    />
                  )
                }}
              />
            </div>
          ) : isLoading ? (
            <div className='space-y-4 isolate'>
              <AlphaSkeletonList />
            </div>
          ) : null}

          <ChadFilterDrawer
            isChad={alphaUser?.isChad ?? false}
            raffles={raffles}
            isShown={isFilterDrawerOpen}
            onClose={() => setIsFilterDrawerOpen(false)}
            pageName={PageName.Bookmark}
          />
        </div>
      )}
    </BottomModal>
  )
}
