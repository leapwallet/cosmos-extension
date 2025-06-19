import { motion } from 'framer-motion'
import { useQueryParams } from 'hooks/useQuery'
import React from 'react'
import { queryParams } from 'utils/query-params'

const tabs = [
  {
    label: 'Alpha',
    value: 'all',
  },
  {
    label: 'Chad Exclusives',
    value: 'exclusive',
  },
]

export const TabSwitch = () => {
  const params = useQueryParams()
  const activeTab = params.get(queryParams.alphaTab) || 'all'

  return (
    <div className='flex w-full border-b border-gray-200 dark:border-gray-800 relative'>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`flex-1 font-bold text-center text-sm transition-colors duration-200 flex justify-center items-center ${
            tab.value === activeTab ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => params.set(queryParams.alphaTab, tab.value)}
        >
          <div className='relative py-4 w-fit px-3'>
            {tab.label}

            {tab.value === activeTab && (
              <motion.div
                className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-10'
                layoutId='active-tab-indicator'
              />
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
