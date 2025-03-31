import React from 'react'
import { cn } from 'utils/cn'

type TabsProps = {
  tabsList: {
    id: string
    label: string
  }[]
  tabsContent: {
    [key: string]: React.ReactNode
  }
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({ tabsList, tabsContent, className }) => {
  const [activeTab, setActiveTab] = React.useState(tabsList[0].id)

  return (
    <div className={cn('w-full', className)}>
      <div className='w-full flex items-center justify-start border-b border-border-bottom'>
        {tabsList.map(({ id, label }) => (
          <button
            key={id}
            className={`px-4 py-2 cursor-pointer transition-colors border-b-2 ${
              activeTab === id
                ? 'dark:border-white-100 border-gray-900 font-bold text-gray-900 dark:text-white-100'
                : 'border-transparent text-gray-700 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className='w-full'>{tabsContent[activeTab]}</div>
    </div>
  )
}
