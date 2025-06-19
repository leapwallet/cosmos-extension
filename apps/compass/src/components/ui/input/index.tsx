import * as React from 'react'
import { cn } from 'utils/cn'

export type InputStatus = 'error' | 'success' | 'warning' | 'default'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  trailingElement?: React.ReactNode
  status?: InputStatus
  inputClassName?: string
}

export const inputStatusOutlineClassMap = {
  error: 'ring-destructive-100 focus-within:ring-destructive-100 ring-1',
  success: 'ring-accent-success focus-within:ring-accent-success ring-1',
  warning: 'ring-accent-warning focus-within:ring-accent-warning ring-1',
  default:
    'focus-within:ring-accent-blue-200 focus-within:hover:ring-accent-blue-200 focus-within:ring-1 hover:ring-secondary-400 hover:ring-1 data-[disabled=true]:ring-0',
} as const

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, trailingElement, status, inputClassName, ...props }, ref) => {
    return (
      <div
        data-disabled={props.disabled}
        className={cn(
          'flex items-center h-12 gap-2 w-full rounded-xl px-5 text-md font-medium shadow-sm transition-shadow disabled:cursor-not-allowed disabled:opacity-50 md:text-sm outline outline-0 bg-secondary-200 placeholder:text-muted-foreground caret-blue-200',
          inputStatusOutlineClassMap[status || 'default'] ?? inputStatusOutlineClassMap.default,
          className,
        )}
      >
        <input
          ref={ref}
          className={cn(
            'rounded-l-md border-none py-1 rounded-md outline-none placeholder-shown:font-sans bg-transparent flex-1',
            inputClassName,
          )}
          {...props}
        />

        {trailingElement}
      </div>
    )
  },
)

Input.displayName = 'Input'
