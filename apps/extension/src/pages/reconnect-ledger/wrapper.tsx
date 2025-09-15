import { motion, Variants } from 'framer-motion'
import React, { ReactNode } from 'react'
import { cn } from 'utils/cn'
import { transition } from 'utils/motion-variants'

type ReconnectLedgerWrapperProps = {
  children: ReactNode
  heading: ReactNode
  subHeading?: ReactNode
  entry?: 'left' | 'right'
  className?: string
  headerIcon?: ReactNode
}

export const reconnectLedgerWrapperVariants: Variants = {
  fromLeft: {
    opacity: 0,
    x: -25,
    transition,
  },
  fromRight: {
    opacity: 0,
    x: 25,
    transition,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition,
  },
  exit: {
    opacity: 0,
    x: 0,
    transition: { ...transition, duration: 0.15 },
  },
}

export const ReconnectLedgerWrapper = ({
  children,
  heading,
  subHeading,
  className,
  entry = 'right',
  headerIcon,
}: ReconnectLedgerWrapperProps) => {
  return (
    <motion.div
      className={cn('flex flex-col items-stretch w-full h-full gap-7', className)}
      variants={reconnectLedgerWrapperVariants}
      initial={entry === 'left' ? 'fromLeft' : 'fromRight'}
      animate='animate'
      exit='exit'
    >
      <header className='flex flex-col items-center gap-1'>
        {headerIcon && (
          <div className='size-16 bg-secondary-200 rounded-full grid place-content-center'>
            {headerIcon}
          </div>
        )}

        <h1 className='font-bold text-[1.5rem] text-center'>{heading}</h1>
        {subHeading && (
          <div className='text-[0.875rem] font-medium text-muted-foreground leading-[1.4rem] text-center'>
            {subHeading}
          </div>
        )}
      </header>

      {children}
    </motion.div>
  )
}
