import React from 'react'
import { cn } from 'utils/cn'

export const PageHeader = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-10 backdrop-blur-lg isolate bg-secondary-100/75 panel-width flex items-center justify-between px-5 py-3.5',
        className,
      )}
    >
      {children}
    </header>
  )
}

PageHeader.displayName = 'PageHeader'
