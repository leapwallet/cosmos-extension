import { motion, MotionProps } from 'framer-motion'
import React, { PropsWithChildren, ReactNode } from 'react'
import { cn } from 'utils/cn'

type ExtensionPageProps = {
  children?: ReactNode
  className?: string
  hideRightActions?: boolean
} & MotionProps

export const OnboardingLayout = ({
  className,
  children,
  ...props
}: PropsWithChildren<ExtensionPageProps>) => {
  return (
    <motion.div
      className={cn(
        'overflow-auto bg-secondary overflow-x-hidden my-auto mx-auto rounded-3xl flex h-full w-full',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
