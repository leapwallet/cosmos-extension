import { Slot } from '@radix-ui/react-slot'
import React from 'react'
import { cn } from 'utils/cn'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

export const Skeleton = ({ className, asChild = false, ...props }: SkeletonProps) => {
  const Comp = asChild ? Slot : 'div'

  return <Comp className={cn('animate-pulse rounded-md bg-primary/10', className)} {...props} />
}

Skeleton.displayName = 'Skeleton'
