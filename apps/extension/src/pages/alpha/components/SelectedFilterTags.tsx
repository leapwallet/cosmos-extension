import { X } from '@phosphor-icons/react'
import Text from 'components/text'
import React from 'react'

import { useChadProvider } from '../context/chad-exclusives-context'
import { useFilters } from '../context/filter-context'

export default function SelectedFilterTags() {
  const { selectedOpportunities, selectedEcosystems, setOpportunities, setEcosystems } =
    useFilters()

  const handleRemoveCategory = (category: string) => {
    setOpportunities(selectedOpportunities?.filter((c) => c !== category) || [])
  }

  const handleRemoveEcosystem = (ecosystem: string) => {
    setEcosystems(selectedEcosystems?.filter((e) => e !== ecosystem) || [])
  }

  return (
    <section className='flex flex-wrap gap-2'>
      {selectedOpportunities.map((category) => {
        return (
          <div
            key={category}
            className='flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-gray-100 dark:bg-gray-900 rounded-full shrink-0'
          >
            <Text size='xs' className='!text-gray-600 dark:!text-gray-400 font-semibold'>
              {category}
            </Text>
            <button
              onClick={() => handleRemoveCategory(category)}
              className='p-[2px] hover:bg-gray-200 dark:hover:bg-gray-500 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out'
            >
              <X size={10} weight='bold' className='text-gray-100 dark:text-gray-900' />
            </button>
          </div>
        )
      })}
      {selectedEcosystems.map((ecosystem) => {
        return (
          <div
            key={ecosystem}
            className='flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-gray-100 dark:bg-gray-900 rounded-full shrink-0'
          >
            <Text size='xs' className='!text-gray-600 dark:!text-gray-400 font-semibold'>
              {ecosystem}
            </Text>
            <button
              onClick={() => handleRemoveEcosystem(ecosystem)}
              className='p-[2px] hover:bg-gray-200 dark:hover:bg-gray-500 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out'
            >
              <X size={10} weight='bold' className='text-gray-100 dark:text-gray-900' />
            </button>
          </div>
        )
      })}
    </section>
  )
}

export function SelectedChadFilterTags() {
  const { selectedOpportunities, selectedEcosystems, setOpportunities, setEcosystems } =
    useChadProvider()

  const handleRemoveCategory = (category: string) => {
    setOpportunities(selectedOpportunities?.filter((c) => c !== category) || [])
  }

  const handleRemoveEcosystem = (ecosystem: string) => {
    setEcosystems(selectedEcosystems?.filter((e) => e !== ecosystem) || [])
  }

  return (
    <section className='flex flex-wrap gap-2 mb-2'>
      {selectedOpportunities.map((category) => {
        return (
          <div
            key={category}
            className='flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-secondary-200 rounded-full shrink-0 border border-secondary-600 '
          >
            <span className='text-xs text-muted-foreground'>{category}</span>
            <button
              onClick={() => handleRemoveCategory(category)}
              className='p-0.5 bg-secondary-600 hover:bg-secondary-800 rounded-full transition-colors duration-200 ease-in-out'
            >
              <X size={10} weight='bold' className='text-gray-100 dark:text-gray-900' />
            </button>
          </div>
        )
      })}
      {selectedEcosystems.map((ecosystem) => {
        return (
          <div
            key={ecosystem}
            className='flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-secondary-200 rounded-full shrink-0 border border-secondary-600 '
          >
            <span className='text-xs text-muted-foreground'>{ecosystem}</span>
            <button
              onClick={() => handleRemoveEcosystem(ecosystem)}
              className='p-0.5 bg-secondary-600 hover:bg-secondary-800 rounded-full transition-colors duration-200 ease-in-out'
            >
              <X size={10} weight='bold' className='text-gray-100 dark:text-gray-900' />
            </button>
          </div>
        )
      })}
    </section>
  )
}
