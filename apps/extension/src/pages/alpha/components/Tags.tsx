import Text from 'components/text'
import React from 'react'

export default function Tags({
  ecosystemFilter,
  categoryFilter,
  handleEcosystemClick,
  handleCategoryClick,
}: {
  ecosystemFilter: string[]
  categoryFilter: string[]
  handleEcosystemClick?: (e: React.MouseEvent<HTMLDivElement>, ecosystem: string) => void
  handleCategoryClick?: (e: React.MouseEvent<HTMLDivElement>, category: string) => void
}) {
  return (
    <div className='flex flex-wrap gap-1'>
      {ecosystemFilter?.filter(Boolean).map((ecosystem) => (
        <div
          key={ecosystem}
          className='flex gap-1 items-center px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded-full inline-block w-fit cursor-pointer'
          onClick={(e) => handleEcosystemClick?.(e, ecosystem)}
        >
          <Text
            size='xs'
            className='hover:!text-gray-300 dark:hover:!text-gray-100 !text-gray-600 dark:!text-gray-400 font-semibold transition-colors duration-200 ease-in-out'
          >
            {ecosystem}
          </Text>
        </div>
      ))}
      {categoryFilter?.filter(Boolean).map((category) => (
        <div
          key={category}
          className='flex gap-1 items-center px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded-full inline-block w-fit cursor-pointer'
          onClick={(e) => handleCategoryClick?.(e, category)}
        >
          <Text
            size='xs'
            className='hover:!text-gray-300 dark:hover:!text-gray-100 !text-gray-600 dark:!text-gray-400 font-semibold transition-colors duration-200 ease-in-out'
          >
            {category}
          </Text>
        </div>
      ))}
    </div>
  )
}
