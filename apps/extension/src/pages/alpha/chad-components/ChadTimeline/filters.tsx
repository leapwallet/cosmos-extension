import { X } from '@phosphor-icons/react'
import { Button } from 'components/ui/button'
import { SearchInput } from 'components/ui/input/search-input'
import { AnimatePresence, motion } from 'framer-motion'
import { useQueryParams } from 'hooks/useQuery'
import { SearchIcon } from 'icons/search-icon'
import { TuneIcon } from 'icons/tune-icon'
import React, { useState } from 'react'
import { cn } from 'utils/cn'
import { transition250 } from 'utils/motion-variants'
import { queryParams } from 'utils/query-params'

export enum StatusFilter {
  Live = 'live',
  Upcoming = 'upcoming',
  Ended = 'ended',
}

const quickFilters = [
  {
    label: 'Live',
    value: StatusFilter.Live,
  },
  {
    label: 'Upcoming',
    value: StatusFilter.Upcoming,
  },
  {
    label: 'Ended',
    value: StatusFilter.Ended,
  },
]

export const FilterButton = (props: React.ComponentProps<typeof Button>) => {
  return (
    <Button
      variant={'secondary'}
      size={'sm'}
      {...props}
      className={cn(
        'bg-secondary-200 font-normal text-xs h-10 rounded-full text-muted-foreground hover:text-foreground p-0',
        props.className,
      )}
    >
      {props.children}
    </Button>
  )
}

const searchInputVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto' },
}

export const Searchbar = (props: { showSearch: boolean; setSearch: (search: string) => void }) => {
  return (
    <AnimatePresence>
      {props.showSearch ? (
        <motion.div
          initial='hidden'
          animate='visible'
          exit='hidden'
          variants={searchInputVariants}
          transition={transition250}
        >
          <SearchInput
            autoFocus
            className='mt-4 py-0'
            placeholder='Search...'
            onClear={() => props.setSearch('')}
            onChange={(e) => props.setSearch(e.target.value)}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

const searchButtonVariants = {
  hidden: { opacity: 0, scale: 0.95, rotate: 90 },
  visible: { opacity: 1, scale: 1, rotate: 0 },
}

export const SearchToggleIcon = (props: { showSearch: boolean; className?: string }) => {
  return (
    <AnimatePresence mode='wait'>
      {props.showSearch ? (
        <motion.div
          key='search'
          initial='hidden'
          animate='visible'
          className='size-10 grid place-content-center'
          variants={searchButtonVariants}
          transition={transition250}
        >
          <X className={cn('size-5', props.className)} />
        </motion.div>
      ) : (
        <motion.div
          key='clear'
          initial='hidden'
          animate='visible'
          className='size-10 grid place-content-center'
          variants={searchButtonVariants}
          transition={transition250}
        >
          <SearchIcon className={cn('size-5', props.className)} />
        </motion.div>
      )}
      <span className='sr-only'>Search</span>
    </AnimatePresence>
  )
}

export const ChadExclusivesFilters = (props: {
  className?: string
  setIsFilterDrawerOpen: (open: boolean) => void
  setSearch: (search: string) => void
}) => {
  const [showSearch, setShowSearch] = useState(false)
  const params = useQueryParams()

  const status = params.get(queryParams.alphaDateStatus) as StatusFilter | null

  return (
    <div className={cn('flex flex-col', props.className)}>
      <div className='flex gap-2 items-center'>
        <div className='flex gap-2 items-center'>
          {quickFilters.map((filter) => (
            <FilterButton
              key={filter.value}
              className={cn(
                'px-4',
                status === filter.value &&
                  'bg-secondary-500 ring-muted-foreground/75 ring-1 text-foreground',
              )}
              onClick={() => {
                if (status === filter.value) {
                  params.remove(queryParams.alphaDateStatus)
                } else {
                  params.set(queryParams.alphaDateStatus, filter.value)
                }
              }}
            >
              {filter.label}
            </FilterButton>
          ))}
        </div>

        <FilterButton
          className='rounded-full ml-auto'
          onClick={() => {
            setShowSearch(!showSearch)
            props.setSearch('')
          }}
        >
          <SearchToggleIcon showSearch={showSearch} />
        </FilterButton>

        <FilterButton
          className='rounded-full size-10 grid place-content-center'
          onClick={() => props.setIsFilterDrawerOpen(true)}
        >
          <TuneIcon className='size-5' />
          <span className='sr-only'>Filters</span>
        </FilterButton>
      </div>

      <Searchbar showSearch={showSearch} setSearch={props.setSearch} />
    </div>
  )
}
