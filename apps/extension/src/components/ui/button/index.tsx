import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from 'utils/cn'

export const buttonRingClass =
  ' ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none focus-visible:ring-accent-success/50'

const buttonVariants = cva(
  'inline-flex items-center shrink-0 cursor-pointer justify-center text-foreground rounded-full gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed' +
    buttonRingClass,
  {
    variants: {
      variant: {
        default: 'bg-primary hover:bg-primary-hover disabled:bg-primary/40 text-white-100',
        mono: 'bg-monochrome hover:bg-monochrome-hover disabled:bg-foreground/40 text-monochrome-foreground',
        ghost:
          'text-muted-foreground hover:text-foreground bg-transparent disabled:text-muted-foreground',
        action:
          'bg-accent-green-700 hover:bg-accent-green-600 disabled:bg-accent-green-600/40 text-accent-green-foreground gap-1',
        secondary:
          'bg-secondary-300 hover:bg-secondary-350 disabled:bg-secondary-100/40 text-secondary-foreground',
        destructive:
          'bg-destructive-100 hover:bg-destructive-100/80 disabled:bg-destructive-100/40 text-destructive-foreground',
      },
      size: {
        default: 'h-[3.25rem] px-6 py-2 text-md',
        md: 'h-auto rounded-full py-3 px-4 text-sm',
        slim: 'h-auto rounded-full py-2 px-3 text-sm',
        sm: 'h-8 rounded-full px-3 text-xs',
        icon: 'p-3 text-sm',
        iconSm: 'p-2 text-sm',
        action: 'text-sm h-7 px-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
