import { ButtonProps } from 'components/ui/button'
import { Button } from 'components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { CopyIcon } from 'icons/copy-icon'
import { Images } from 'images'
import React, { useEffect, useState } from 'react'
import { cn } from 'utils/cn'

const transition = { duration: 0.15, type: 'easeIn' }

const copyVariants = {
  hide: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
}

export const CopyButton = (props: ButtonProps) => {
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
      title='Copy'
      className={cn(props.className, isCopied ? 'text-accent-success' : 'text-muted-foreground')}
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
            className='size-5'
            transition={transition}
            variants={copyVariants}
            initial='hide'
            animate='animate'
            exit='hide'
          />
        ) : (
          <motion.div
            key='copy'
            transition={transition}
            variants={copyVariants}
            initial='hide'
            animate='animate'
            exit='hide'
          >
            <CopyIcon className='size-5' />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
}

CopyButton.displayName = 'CopyButton'
