import { motion } from 'framer-motion'
import { HappyFrog } from 'icons/frog'
import React from 'react'
import { cn } from 'utils/cn'

interface EmptyBookmarksProps {
  title: string
  subTitle: string | React.ReactNode
  className?: string
  showRetryButton?: boolean
}

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const transition = {
  duration: 0.3,
  ease: 'easeOut',
}

export default function EmptyBookmarks({ title, subTitle, className }: EmptyBookmarksProps) {
  return (
    <motion.div
      initial='hidden'
      animate='visible'
      variants={variants}
      transition={transition}
      className={cn(
        'bg-secondary-100 flex flex-col gap-2 items-center justify-center pt-[3.375rem] pb-[3.75rem] px-5 text-center rounded-2xl',
        className,
      )}
    >
      <HappyFrog className='size-20 ' />

      <span className='font-bold text-mdl mb-1'>{title}</span>
      <span className='text-sm font-medium text-center text-muted-foreground !leading-5 px-11'>
        {subTitle}
      </span>
    </motion.div>
  )
}
