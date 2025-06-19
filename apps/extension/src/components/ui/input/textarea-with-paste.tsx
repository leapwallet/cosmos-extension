import React from 'react'
import { UserClipboard } from 'utils/clipboard'
import { cn } from 'utils/cn'

import { buttonRingClass } from '../button'
import { Textarea } from './textarea'

type TextareaWithPasteProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange'
> & {
  value: string
  onChange: (value: string) => void
  error?: string
}

export const TextareaWithPaste = ({ error, onChange, ...props }: TextareaWithPasteProps) => {
  return (
    <div className='relative'>
      <Textarea
        className='w-full h-[9.375rem] resize-none'
        status={error ? 'error' : undefined}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />

      <button
        tabIndex={props.value ? -1 : 0}
        className={cn(
          'absolute bottom-4 right-3 bg-secondary text-sm font-medium px-[0.625rem] leading-6 text-muted-foreground rounded-lg hover:text-foreground transition-[color,opacity] h-[1.625rem]',
          props.value ? 'opacity-0  pointer-events-none' : 'opacity-100',
          buttonRingClass,
        )}
        onClick={async (e) => {
          e.preventDefault()
          const text = await UserClipboard.pasteText()
          if (text) {
            onChange?.(text)
          }
        }}
      >
        Paste
      </button>
    </div>
  )
}
