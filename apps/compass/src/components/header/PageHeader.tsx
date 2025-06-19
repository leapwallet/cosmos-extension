import React from 'react'
import { PageHeaderProps } from 'types/components'
import { cn } from 'utils/cn'

const PageHeader = React.memo(({ children, className }: PageHeaderProps) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-10 backdrop-blur-lg isolate border-b border-border-bottom/50 panel-width flex items-center justify-between px-3 py-2',
        className,
      )}
    >
      {children}
    </header>
  )
})

PageHeader.displayName = 'PageHeader'
export { PageHeader }
