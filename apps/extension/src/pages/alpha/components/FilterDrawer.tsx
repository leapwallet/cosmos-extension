import { Notebook } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import { PageName } from 'config/analytics'
import { AlphaOpportunity } from 'hooks/useAlphaOpportunities'
import React, { useMemo } from 'react'

import { useFilters } from '../context/filter-context'
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

export default function FilterDrawer({
  opportunities,
  isShown,
  onClose,
  pageName,
}: Omit<
  FilterDrawerProps,
  'selectedOpportunities' | 'selectedEcosystems' | 'setOpportunities' | 'setEcosystems'
>) {
  const { clearFilters } = useFilters()

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
    <BottomModal isOpen={isShown} onClose={onClose} title='Filter by' closeOnBackdropClick={true}>
      <div className='flex flex-col gap-4'>
        {/* all posts tab */}
        <button onClick={clearFilters} className='mb-2 cursor-pointer'>
          <div className='bg-gray-100 dark:bg-gray-950 rounded-xl p-3 flex items-center gap-3'>
            <div className='p-1 rounded-full bg-gray-200 dark:bg-gray-800'>
              <Notebook className='h-4 w-4 text-gray-600 dark:text-gray-400' />
            </div>
            <Text size='sm' className='font-semibold'>
              All Posts
            </Text>
          </div>
        </button>

        <CategoryFilter categoryFilters={categoryFilters} pageName={pageName} />
        <EcosystemFilter ecosystemFilters={ecosystemFilters} pageName={pageName} />
      </div>
    </BottomModal>
  )
}
