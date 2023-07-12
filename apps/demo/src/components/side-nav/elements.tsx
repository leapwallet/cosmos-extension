import React, { PropsWithChildren } from 'react'

export const SideNavSectionHeader: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className='w-full h-10 px-4 pb-1 pt-5 font-bold text-xs bg-white-100 dark:bg-gray-900 dark:text-white-100'>
      {children}
    </div>
  )
}

export const SideNavSection: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className='overflow-hidden rounded-2xl bg-white-100 dark:bg-gray-900 mt-4 side-nav-section bg-gray-100 dark:bg-gray-900'>
      {children}
    </div>
  )
}

export const OverflowSideNavSection: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className='rounded-2xl mt-4 min-h-fit'>{children}</div>
}
