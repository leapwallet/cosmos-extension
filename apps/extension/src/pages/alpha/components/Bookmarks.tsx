import { Header, ThemeName, useTheme } from '@leapwallet/leap-ui'
import { PageName } from 'config/analytics'
import { AnimatePresence, motion } from 'framer-motion'
import Fuse from 'fuse.js'
import { useAlphaOpportunities } from 'hooks/useAlphaOpportunities'
import { Images } from 'images'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { HeaderActionType } from 'types/components'

import { useBookmarks } from '../context/bookmark-context'
import { useFilters } from '../context/filter-context'
import { sortOpportunitiesByDate } from '../utils'
import { VirtualizationFooter } from './alpha-timeline'
import AlphaOpportunity from './AlphaOpportunity'
import EmptyBookmarks from './EmptyBookmarks'
import FilterButton from './FilterButton'
import FilterDrawer from './FilterDrawer'
import { NoFilterResult, NoSearchResult } from './NoResultStates'
import SelectedFilterTags from './SelectedFilterTags'
type BookmarkedAlphaProps = {
  isOpen: boolean
  toggler: () => void
}

export const BookmarkedAlpha: React.FC<BookmarkedAlphaProps> = ({ isOpen, toggler }) => {
  const { opportunities, isLoading } = useAlphaOpportunities()
  const { bookmarks } = useBookmarks()
  const { theme } = useTheme()
  const { selectedOpportunities, selectedEcosystems } = useFilters()
  const containerRef = useRef<HTMLDivElement>(null)

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [searchedTerm, setSearchedTerm] = useState('')
  const [customScrollParent, setCustomScrollParent] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.height = '100%'
      const parentElement = containerRef.current.parentElement
      if (parentElement) {
        if (isOpen) {
          parentElement.style.overflow = 'hidden'
        } else {
          parentElement.style.overflow = 'auto'
        }
      }
    }
  }, [isOpen])

  /**
   * @description filtering alphas acording to search query
   */
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

  /**
   * @description filtering alphas acording to category and ecosystem filters
   */
  const filteredOpportunities = useMemo(() => {
    const filteredList = searchedOpportunities.filter((opportunity) =>
      bookmarks.has(opportunity.id ?? ''),
    )

    if (!selectedOpportunities?.length && !selectedEcosystems?.length) return filteredList

    return filteredList.filter((opportunity) => {
      return (
        (!selectedOpportunities?.length ||
          selectedOpportunities.every((category) =>
            opportunity.categoryFilter.includes(category),
          )) &&
        (!selectedEcosystems?.length ||
          selectedEcosystems.every((ecosystem) => opportunity.ecosystemFilter.includes(ecosystem)))
      )
    })
  }, [searchedOpportunities, selectedOpportunities, selectedEcosystems, bookmarks])

  const filterCount = selectedEcosystems?.length + selectedOpportunities?.length

  return (
    <>
      <AnimatePresence>
        {isOpen && (
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
              <Header
                title='Bookmarks'
                action={{ type: HeaderActionType.BACK, onClick: toggler }}
              />
            </div>
            {filteredOpportunities.length === 0 &&
            filterCount === 0 &&
            !isLoading &&
            !searchedTerm ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className='flex-1 overflow-y-auto'
              >
                <div className='flex flex-col gap-4 p-7'>
                  <EmptyBookmarks
                    title='No Bookmarks Found'
                    subTitle='Try looking at some alphas and saving them '
                  />
                </div>
              </motion.div>
            ) : (
              <div className='flex-1 overflow-y-auto' ref={setCustomScrollParent}>
                <div className='flex flex-col gap-4 p-7'>
                  {/* Search & Filter */}
                  <div className='flex gap-2 items-center'>
                    <div className='flex w-full bg-white-100 dark:bg-gray-950 rounded-full py-2 pl-5 pr-[10px] items-center'>
                      <input
                        type='text'
                        value={searchedTerm}
                        onChange={(e) => setSearchedTerm(e.target.value)}
                        placeholder='Search...'
                        className='bg-transparent w-full outline-none text-black-100 dark:text-white-100 placeholder:text-gray-600 dark:placeholder:text-gray-400'
                      />
                      {searchedTerm.length === 0 ? (
                        <img
                          className='h-5 w-5 mt-0.5'
                          src={
                            theme === ThemeName.DARK
                              ? Images.Misc.SearchWhiteIcon
                              : Images.Misc.Search
                          }
                        />
                      ) : (
                        <img
                          className='cursor-pointer h-4 w-4 mt-1'
                          src={Images.Misc.CrossFilled}
                          onClick={() => setSearchedTerm('')}
                        />
                      )}
                    </div>
                    <FilterButton
                      setIsFilterDrawerOpen={setIsFilterDrawerOpen}
                      filterCount={filterCount}
                    />
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
                  {filteredOpportunities.length > 0 ? (
                    <div className='h-full flex flex-col flex-1'>
                      <Virtuoso
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
                              pageName={PageName.Bookmark}
                              isBookmarked={bookmarks.has(opportunity.id ?? '')}
                            />
                          )
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
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
