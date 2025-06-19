import { AnimatePresence, motion } from 'framer-motion'
import { CopyIcon } from 'icons/copy-icon'
import { Images } from 'images'
import React, { useEffect, useState } from 'react'
import { cn } from 'utils/cn'

import { Button, ButtonProps } from '.'

const transition = { duration: 0.15, type: 'easeIn' }

const copyVariants = {
  hide: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
}

export const CopyButton = ({ children, ...props }: ButtonProps) => {
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false)
      }, 2_000)
    }
  }, [isCopied])

  return (
    <Button
      variant='ghost'
      size='sm'
      {...props}
      className={cn(
        props.className,
        isCopied
          ? 'text-accent-success hover:text-accent-success'
          : 'text-accent-blue hover:text-accent-blue-200',
      )}
      onClick={(e) => {
        setIsCopied(true)
        props.onClick?.(e)
      }}
    >
      <AnimatePresence mode='wait'>
        {isCopied ? (
          <motion.img
            key='check'
            src={Images.Misc.CheckGreenOutline}
            alt='check'
            className='size-4'
            transition={transition}
            variants={copyVariants}
            initial='hide'
            animate='animate'
            exit='hide'
          />
        ) : (
          <motion.div
            key='copy'
            className='size-4'
            transition={transition}
            variants={copyVariants}
            initial='hide'
            animate='animate'
            exit='hide'
          >
            <CopyIcon className='size-4' />
          </motion.div>
        )}
      </AnimatePresence>
      {children || 'Copy'}
    </Button>
  )
}

CopyButton.displayName = 'CopyButton'
