import { Button } from 'components/ui/button'
import { motion } from 'framer-motion'
import React from 'react'

import { onboardingWrapperVariants } from '../wrapper'

export const ContinueWithSocialWallet = (props: {
  title: string
  description: string
  cta: string
  isLoading?: boolean
  onClick: () => void
}) => {
  return (
    <motion.div
      className='flex flex-col gap-6 justify-center h-full'
      variants={onboardingWrapperVariants}
      initial='fromRight'
      animate='animate'
      exit='exit'
    >
      <div className='flex flex-col gap-6 justify-center items-center my-auto'>
        <div className='size-[134px] bg-secondary-400 rounded-full' />

        <div className='flex flex-col gap-3 justify-center items-center'>
          <h2 className='text-2xl font-bold'>{props.title}</h2>
          <p className='text-[14px] text-center'>{props.description}</p>
        </div>
      </div>

      <Button onClick={props.onClick} disabled={props.isLoading}>
        {props.cta}
      </Button>
    </motion.div>
  )
}
