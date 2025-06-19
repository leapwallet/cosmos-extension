import { Transition, Variants } from 'framer-motion'

export const transition: Transition = { duration: 0.35, type: 'easeOut' }
export const transition250: Transition = { duration: 0.25, type: 'easeOut' }
export const transition150: Transition = { duration: 0.15, type: 'easeOut' }

export const errorVariants: Variants = {
  hidden: { opacity: 0, transition: { duration: 0.1 } },
  visible: { opacity: 1, transition: { duration: 0.1 } },
}

export const opacityFadeInOut: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}
