import { SearchIcon } from 'icons/search-icon'
import React from 'react'
import { cn } from 'utils/cn'

import { Input } from '.'

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear: () => void
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        {...props}
        className={cn(
          'py-3 px-4 rounded-2xl bg-secondary-100 focus-within:ring-secondary-700 focus-within:hover:ring-secondary-700',
          className,
        )}
        trailingElement={
          (props?.value as string)?.length > 0 ? (
            <button onClick={onClear} className='shrink-0 text-muted-foreground text-sm'>
              clear
            </button>
          ) : (
            <SearchIcon className='text-muted-foreground' />
          )
        }
      />
    )
  },
)

SearchInput.displayName = 'SearchInput'
