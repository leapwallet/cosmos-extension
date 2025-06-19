import BottomModal from 'components/new-bottom-modal'
import { PageName } from 'config/analytics'
import { AlphaOpportunity } from 'hooks/useAlphaOpportunities'
import React, { useMemo } from 'react'

import CategoryFilter from './CategoryFilter'
import EcosystemFilter from './EcosystemFilter'

type FilterDrawerProps = {
  opportunities: AlphaOpportunity[]
  isShown: boolean
  onClose: () => void
  selectedOpportunities: string[] | undefined
  selectedEcosystems: string[] | undefined
  setOpportunities: (opportunities: string[]) => void
  setEcosystems: (ecosystems: string[]) => void
  pageName: PageName
}

export function FilterDrawer({
  opportunities,
  isShown,
  onClose,
  pageName,
}: Omit<
  FilterDrawerProps,
  'selectedOpportunities' | 'selectedEcosystems' | 'setOpportunities' | 'setEcosystems'
>) {
  const categoryFilters = useMemo(() => {
    const categories = new Set<string>()
    opportunities?.forEach((opportunity) => {
      opportunity.categoryFilter.forEach((category) => {
        const trimmed = category.trim()
        if (trimmed) categories.add(trimmed)
      })
    })
    return Array.from(categories)
  }, [opportunities])

  const ecosystemFilters = useMemo(() => {
    const ecosystems = new Set<string>()
    opportunities?.forEach((opportunity) => {
      opportunity.ecosystemFilter.forEach((ecosystem) => {
        const trimmed = ecosystem.trim()
        if (trimmed) ecosystems.add(trimmed)
      })
    })
    return Array.from(ecosystems)
  }, [opportunities])

  return (
    <BottomModal
      fullScreen
      isOpen={isShown}
      onClose={onClose}
      title='Filter by'
      className='flex flex-col gap-10'
    >
      <CategoryFilter categoryFilters={categoryFilters} pageName={pageName} />
      <EcosystemFilter ecosystemFilters={ecosystemFilters} pageName={pageName} />
    </BottomModal>
  )
}

export function EcosystemFilterDrawer({
  opportunities,
  isShown,
  onClose,
  pageName,
}: Omit<
  FilterDrawerProps,
  'selectedOpportunities' | 'selectedEcosystems' | 'setOpportunities' | 'setEcosystems'
>) {
  const ecosystemFilters = useMemo(() => {
    const ecosystems = new Set<string>()
    opportunities?.forEach((opportunity) => {
      opportunity.ecosystemFilter.forEach((ecosystem) => {
        const trimmed = ecosystem.trim()
        if (trimmed) ecosystems.add(trimmed)
      })
    })
    return Array.from(ecosystems)
  }, [opportunities])

  return (
    <BottomModal
      fullScreen
      isOpen={isShown}
      onClose={onClose}
      title='Filter by'
      className='flex flex-col gap-10'
    >
      <EcosystemFilter ecosystemFilters={ecosystemFilters} pageName={pageName} />
    </BottomModal>
  )
}
