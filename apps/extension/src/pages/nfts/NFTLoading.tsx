import { motion } from 'framer-motion'
import { Images } from 'images'
import { createWalletLoaderVariants } from 'pages/onboarding/create/creating-wallet-loader'
import React from 'react'
import { transition } from 'utils/motion-variants'

export const NFTLoading = () => {
  return (
    <div className='flex flex-col items-center justify-center gap-8 flex-1 pb-[75px]'>
      <div className='relative'>
        <img
          src={Images.Misc.WalletIconGreen}
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
        Loading your NFTs...
      </motion.span>
    </div>
  )
}
