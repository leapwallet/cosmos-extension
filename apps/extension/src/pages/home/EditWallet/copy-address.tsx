import { CheckCircle } from '@phosphor-icons/react'
import { Button } from 'components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { CopyIcon } from 'icons/copy-icon'
import React, { useEffect, useState } from 'react'
import { UserClipboard } from 'utils/clipboard'
import { transition150 } from 'utils/motion-variants'
import { sliceAddress } from 'utils/strings'

const copyVariants = {
  hide: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
}

export const CopyButton = ({ address }: { address: string }) => {
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
      className={
        '!text-xs font-medium text-secondary-800 flex items-center gap-x-2 py-2 px-4 rounded-full bg-secondary-100 hover:bg-secondary-200 transition-colors relative font-DMMono'
      }
      onClick={(e) => {
        setIsCopied(true)
        UserClipboard.copyText(address)
      }}
    >
      {sliceAddress(address)}
      <AnimatePresence mode='wait'>
        {isCopied ? (
          <motion.div
            key='check'
            transition={transition150}
            variants={copyVariants}
            initial='hide'
            animate='animate'
            exit='hide'
          >
            <CheckCircle className='size-4' />
          </motion.div>
        ) : (
          <motion.div
            key='copy'
            transition={transition150}
            variants={copyVariants}
            initial='hide'
            animate='animate'
            exit='hide'
          >
            <CopyIcon className='size-4' />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
}
