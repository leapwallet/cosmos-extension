import Text from 'components/text'
import { EventName, PageName } from 'config/analytics'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import React, { useCallback } from 'react'

import { useFilters } from '../context/filter-context'
import { CategoryIcon } from '../utils/filters'
import FilterItem from './FilterItem'

export default function CategoryFilter({
  categoryFilters,
  pageName,
}: {
  categoryFilters: string[]
  pageName: PageName
}) {
  const { selectedOpportunities, selectedEcosystems, setOpportunities } = useFilters()

  const handleCategoryToggle = useCallback(
    (category: string) => {
      try {
        const newCategories = selectedOpportunities?.includes(category)
          ? selectedOpportunities.filter((o) => o !== category)
          : [...(selectedOpportunities || []), category]

        setOpportunities(newCategories)
        mixpanel.track(EventName.Filters, {
          filterSelected: [...(newCategories || []), ...(selectedEcosystems || [])],
          filterApplySource: pageName,
        })
      } catch (err) {
        // ignore
      }
    },
    [selectedOpportunities, selectedEcosystems, setOpportunities, pageName],
  )

  return (
    <div className='mb-4'>
      <Text size='sm' className='text-gray-600 dark:text-gray-400 mb-3'>
        Category
      </Text>
      <div className='flex flex-col gap-2 bg-gray-100 dark:bg-gray-950 rounded-xl px-2 py-2'>
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
