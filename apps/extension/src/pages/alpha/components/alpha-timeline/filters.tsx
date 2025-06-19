import { CaretDown } from '@phosphor-icons/react'
import { Button } from 'components/ui/button'
import { PageName } from 'config/analytics'
import { useAlphaOpportunities } from 'hooks/useAlphaOpportunities'
import { useQueryParams } from 'hooks/useQuery'
import { SquareGridIcon } from 'icons/square-grid'
import { TuneIcon } from 'icons/tune-icon'
import {
  FilterButton,
  Searchbar,
  SearchToggleIcon,
} from 'pages/alpha/chad-components/ChadTimeline/filters'
import React, { useEffect, useMemo, useState } from 'react'

import { EcosystemFilterDrawer } from '../FilterDrawer'

export const AlphaTimelineFilters = ({
  setSearchedTerm,
  setIsFilterDrawerOpen,
}: {
  setSearchedTerm: (term: string) => void
  setIsFilterDrawerOpen: (open: boolean) => void
}) => {
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    setSearchedTerm('')
  }, [showSearch, setSearchedTerm])

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-3 justify-between '>
        <EcosystemFilter />

        <FilterButton
          className='ml-auto size-8'
          size='sm'
          onClick={() => setShowSearch(!showSearch)}
        >
          <SearchToggleIcon showSearch={showSearch} className='size-5' />
          <span className='sr-only'>Search</span>
        </FilterButton>

        <FilterButton className='size-8' onClick={() => setIsFilterDrawerOpen(true)}>
          <TuneIcon className='size-5 shrink-0' />
          <span className='sr-only'>Filters</span>
        </FilterButton>
      </div>

      <Searchbar showSearch={showSearch} setSearch={setSearchedTerm} />
    </div>
  )
}

const EcosystemFilter = () => {
  const [isShown, setIsShown] = useState(false)
  const { opportunities } = useAlphaOpportunities()

  const params = useQueryParams()
  const ecosystems = params.get('ecosystem')

  const selectedEcosystems = useMemo(() => {
    if (!ecosystems?.length) return 'All ecosystem'

    const ecosystemArr = ecosystems.split(',')
    return ecosystemArr.length > 1 ? `${ecosystemArr.length} ecosystems` : ecosystemArr[0]
  }, [ecosystems])

  return (
    <>
      <Button
        variant='ghost'
        className='border border-secondary-200 h-[2.375rem] '
        size='sm'
        onClick={() => setIsShown(true)}
      >
        <SquareGridIcon />
        {selectedEcosystems}
        <CaretDown weight='bold' className='size-3 fill-muted-foreground' />
      </Button>

      <EcosystemFilterDrawer
        isShown={isShown}
        onClose={() => setIsShown(false)}
        opportunities={opportunities}
        pageName={PageName.Alpha}
      />
    </>
  )
}
