import { motion, Variants } from 'framer-motion'
import React from 'react'
import { transition } from 'utils/motion-variants'

import { useForgotPasswordContext } from '../context'

const variants: Variants = {
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

export const ForgotPasswordWrapper = ({ children }: { children: React.ReactNode }) => {
  const { prevProcessStep, processStep } = useForgotPasswordContext()

  return (
    <motion.div
      variants={variants}
      initial={prevProcessStep < processStep ? 'fromRight' : 'fromLeft'}
      animate='animate'
      exit='exit'
      className='flex flex-col justify-center h-full gap-5'
    >
      {children}
    </motion.div>
  )
}
