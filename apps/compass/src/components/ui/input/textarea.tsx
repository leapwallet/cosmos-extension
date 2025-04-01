import * as React from 'react'
import { cn } from 'utils/cn'

import { InputStatus, inputStatusOutlineClassMap } from '.'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  status?: InputStatus
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, status, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'w-full rounded-xl p-4 text-md font-medium shadow-sm transition-shadow disabled:cursor-not-allowed disabled:opacity-50 md:text-sm outline outline-0 bg-secondary-200 placeholder:text-muted-foreground caret-accent-blue-200',
          inputStatusOutlineClassMap[status || 'default'] ?? inputStatusOutlineClassMap.default,
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'
