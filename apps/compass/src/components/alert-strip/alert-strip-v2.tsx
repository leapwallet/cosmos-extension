import { Info, Warning, WarningCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import React from 'react'
import { cn } from 'utils/cn'
import { opacityFadeInOut, transition150 } from 'utils/motion-variants'

const alertStripV2Config = {
  info: {
    className: 'bg-accent-blue-700 text-accent-blue-foreground',
    Icon: Info,
    weight: 'regular',
  },
  warning: {
    className: 'bg-accent-warning-700 text-accent-warning-foreground',
    Icon: Warning,
    weight: 'fill',
  },
  error: {
    className: 'bg-destructive-700 text-destructive-foreground',
    Icon: WarningCircle,
    weight: 'fill',
  },
} as const

export const AlertStripV2 = (props: {
  children: React.ReactNode
  type?: 'info' | 'warning' | 'error'
  className?: string
}) => {
  const { className, Icon, weight } =
    alertStripV2Config[props.type ?? 'info'] || alertStripV2Config.info

  return (
    <motion.div
      transition={transition150}
      variants={opacityFadeInOut}
      initial='hidden'
      animate='visible'
      exit='hidden'
      className={cn(
        'w-full flex justify-center items-center gap-2 p-2 text-xs font-bold',
        className,
        props.className,
      )}
    >
      <Icon weight={weight} className='size-4' />
      <p>{props.children}</p>
    </motion.div>
  )
}
