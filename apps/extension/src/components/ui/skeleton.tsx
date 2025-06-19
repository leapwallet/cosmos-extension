import { Slot } from '@radix-ui/react-slot'
import React from 'react'
import { cn } from 'utils/cn'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

export const Skeleton = ({ className, asChild, ...props }: SkeletonProps) => {
  const Comp = asChild ? Slot : 'div'

  return <Comp className={cn('animate-pulse rounded-md bg-foreground/20', className)} {...props} />
}
