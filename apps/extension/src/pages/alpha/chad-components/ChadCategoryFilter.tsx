import { EventName, PageName } from 'config/analytics'
import { Images } from 'images'
import React, { useCallback } from 'react'
import { mixpanelTrack } from 'utils/tracking'

import FilterItem from '../components/FilterItem'
import { useChadProvider } from '../context/chad-exclusives-context'
import { CategoryIcon } from '../utils/filters'

export default function CategoryFilter({
  categoryFilters,
  pageName,
  isChad,
  onClose,
}: {
  categoryFilters: string[]
  pageName: PageName
  isChad: boolean
  onClose: () => void
}) {
  const { selectedOpportunities, selectedEcosystems, setOpportunities } = useChadProvider()

  const handleCategoryToggle = useCallback(
    (category: string) => {
      const newCategories = selectedOpportunities?.includes(category)
        ? selectedOpportunities.filter((o) => o !== category)
        : [...(selectedOpportunities || []), category]

      setOpportunities(newCategories)
      onClose()
      mixpanelTrack(EventName.Filters, {
        filterSelected: [...(newCategories || []), ...(selectedEcosystems || [])],
        filterApplySource: pageName,
        isChad,
      })
    },
    [selectedOpportunities, setOpportunities, selectedEcosystems, pageName, isChad, onClose],
  )

  return (
    <div className='flex flex-col gap-5'>
      <span className='text-muted-foreground text-sm uppercase font-bold'>Category</span>

      <div className='flex flex-col'>
        {categoryFilters
          ?.sort((a, b) => a.localeCompare(b))
          ?.map((category, index) => (
            <FilterItem
              key={category}
              icon={CategoryIcon[category] ?? Images.Alpha.nftGiveaway}
              label={category}
              isLast={index === categoryFilters.length - 1}
              isSelected={selectedOpportunities?.includes(category)}
              onSelect={() => handleCategoryToggle(category)}
              onRemove={() => handleCategoryToggle(category)}
            />
          ))}
      </div>
    </div>
  )
}
