import { Transition, Variants } from 'framer-motion'

export const transition: Transition = {
  duration: 0.1,
  ease: 'easeInOut',
}

export const transition200: Transition = {
  duration: 0.2,
  ease: 'easeInOut',
}

export const scaleInOut: Variants = {
  hidden: { scale: 0 },
  visible: { scale: 1 },
}

export const scaleInOutHalf: Variants = {
  hidden: { scale: 0.5 },
  visible: { scale: 1 },
}

export const slideVariants: Variants = {
  enter: { opacity: 0, x: '10%' },
  exit: { opacity: 0, x: '-10%' },
  opacity: { opacity: 0 },
  animate: { opacity: 1, x: 0 },
}

export const opacityVariants: Variants = {
  enter: { opacity: 0 },
  exit: { opacity: 0 },
  opacity: { opacity: 0 },
  animate: { opacity: 1 },
}

export const scaleVariants: Variants = {
  enter: { opacity: 0, scale: 1 },
  exit: { opacity: 0, scale: 2 },
  opacity: { opacity: 0 },
  animate: { opacity: 1, scale: 1 },
}

export const bottomNavVariants: Variants = {
  hidden: {
    y: 74,
  },
  visible: {
    y: 0,
  },
}
