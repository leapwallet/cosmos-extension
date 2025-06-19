import { EyeSlash } from '@phosphor-icons/react'
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
    <div className='flex flex-col gap-5'>
      <span className='text-muted-foreground text-sm uppercase font-bold'>Category</span>

      <div className='flex flex-col'>
        {categoryFilters
          ?.sort((a, b) => a.localeCompare(b))
          ?.map((category) => (
            <FilterItem
              key={category}
              icon={CategoryIcon[category] ?? Images.Alpha.nftGiveaway}
              label={category}
              isSelected={selectedOpportunities?.includes(category)}
              onSelect={() => handleCategoryToggle(category)}
              onRemove={() => handleCategoryToggle(category)}
            />
          ))}

        <FilterItem
          key={'hidden'}
          icon={
            <div className='flex items-center justify-center bg-secondary-400 rounded-full size-8'>
              <EyeSlash size={20} />
            </div>
          }
          label={'Hidden'}
          isLast={true}
          isSelected={selectedOpportunities?.includes('hidden')}
          onSelect={() => handleCategoryToggle('hidden')}
          onRemove={() => handleCategoryToggle('hidden')}
        />
      </div>
    </div>
  )
}
