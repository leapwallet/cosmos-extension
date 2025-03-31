import './styles.css'

import { AnimatePresence, motion, Variants } from 'framer-motion'
import { Images } from 'images'
import React from 'react'

const transition = {
  duration: 0.5,
  ease: 'easeInOut',
}

export const createWalletLoaderVariants: Variants = {
  hidden: { opacity: 0, y: '50%' },
  visible: { opacity: 1, y: 0 },
}

export const createWalletLoaderContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const CreatingWalletLoader = () => {
  return (
    <AnimatePresence>
      <motion.div
        transition={transition}
        variants={createWalletLoaderContainerVariants}
        initial='hidden'
        animate='visible'
        className='flex flex-col items-center justify-center gap-8 h-full border-secondary-300 absolute inset-0 z-10 bg-secondary'
      >
        <div className='relative'>
          <img
            src={Images.Misc.WalletIconTeal}
            alt='wallet'
            className='size-6 absolute inset-0 mx-auto my-auto'
          />
          <div className='loader-container'>
            <div className='spinning-loader' />
          </div>
        </div>

        <motion.span
          className='text-secondary-foreground text-xl font-bold'
          transition={transition}
          variants={createWalletLoaderVariants}
          initial='hidden'
          animate='visible'
        >
          Creating your wallet
        </motion.span>
      </motion.div>
    </AnimatePresence>
  )
}
