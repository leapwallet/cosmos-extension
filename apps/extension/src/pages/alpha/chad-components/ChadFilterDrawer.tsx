import BottomModal from 'components/new-bottom-modal'
import { PageName } from 'config/analytics'
import { Raffle } from 'hooks/useAlphaOpportunities'
import React, { useMemo } from 'react'

import ChadCategoryFilter from './ChadCategoryFilter'
import ChadEcosystemFilter from './ChadEcosystemFilter'

type FilterDrawerProps = {
  raffles: Raffle[]
  isShown: boolean
  onClose: () => void
  selectedOpportunities: string[] | undefined
  selectedEcosystems: string[] | undefined
  setOpportunities: (opportunities: string[]) => void
  setEcosystems: (ecosystems: string[]) => void
  pageName: PageName
  isChad: boolean
}

export default function ChadFilterDrawer({
  raffles,
  isShown,
  onClose,
  pageName,
  isChad,
}: Omit<
  FilterDrawerProps,
  'selectedOpportunities' | 'selectedEcosystems' | 'setOpportunities' | 'setEcosystems'
>) {
  const categoryFilters = useMemo(() => {
    const categories = new Set<string>()
    raffles?.forEach((raffle) => {
      raffle.categories?.forEach((category) => {
        const trimmed = category.trim()
        if (trimmed) categories.add(trimmed)
      })
    })
    return Array.from(categories)
  }, [raffles])

  const ecosystemFilters = useMemo(() => {
    const ecosystems = new Set<string>()
    raffles?.forEach((raffle) => {
      raffle.ecosystem?.forEach((ecosystem) => {
        const trimmed = ecosystem.trim()
        if (trimmed) ecosystems.add(trimmed)
      })
    })
    return Array.from(ecosystems)
  }, [raffles])

  return (
    <BottomModal
      fullScreen
      isOpen={isShown}
      onClose={onClose}
      title='Filter by'
      className='flex flex-col gap-10'
    >
      <ChadCategoryFilter
        categoryFilters={categoryFilters}
        pageName={pageName}
        isChad={isChad}
        onClose={onClose}
      />
      <ChadEcosystemFilter
        onClose={onClose}
        ecosystemFilters={ecosystemFilters}
        pageName={pageName}
        isChad={isChad}
      />
    </BottomModal>
  )
}
