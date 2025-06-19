import { AnimatePresence } from 'framer-motion'
import { motion } from 'framer-motion'
import React from 'react'

const transition = { duration: 0.2 }

const passwordStrengthVariants = {
  hidden: { opacity: 0, transition },
  animate: { opacity: 1, transition },
}

export const PasswordStrengthIndicator = ({ score }: { score: number | null }) => {
  return (
    <AnimatePresence>
      <motion.div
        className='flex justify-center items-center font-bold text-sm'
        variants={passwordStrengthVariants}
        initial='hidden'
        animate='animate'
        exit='hidden'
      >
        {score === 4 && (
          <motion.span
            key={score}
            className='text-accent-success'
            variants={passwordStrengthVariants}
            initial='hidden'
            animate='animate'
            exit='hidden'
          >
            Strong
          </motion.span>
        )}
        {score === 3 && (
          <motion.span
            key={score}
            className='text-accent-warning'
            variants={passwordStrengthVariants}
            initial='hidden'
            animate='animate'
            exit='hidden'
          >
            Medium
          </motion.span>
        )}
        {score !== null && score < 3 && (
          <motion.span
            key={score < 3 ? 'weak' : null}
            className='text-destructive-100'
            variants={passwordStrengthVariants}
            initial='hidden'
            animate='animate'
            exit='hidden'
          >
            Weak
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
