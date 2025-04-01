import { Info } from '@phosphor-icons/react'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import { useCaptureUIException } from 'hooks/perf-monitoring/useCaptureUIException'
import React, { useEffect, useRef } from 'react'
import { opacityFadeInOut, transition150 } from 'utils/motion-variants'

type ErrorCardProps = React.ComponentPropsWithoutRef<'div'> & {
  text?: string
  className?: string
  'data-testing-id'?: string
}

export function ErrorCard({ text, className, ...props }: ErrorCardProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useCaptureUIException(text)

  return (
    <motion.div
      ref={ref}
      className={classNames(
        'flex p-4 w-full border justify-start items-center border-destructive bg-destructive-700 overflow-clip rounded-xl',
        className,
      )}
      transition={transition150}
      variants={opacityFadeInOut}
      initial='hidden'
      animate='visible'
      exit='hidden'
    >
      <Info size={20} className='mr-2 text-destructive-foreground' />
      <p
        className='text-destructive-foreground font-medium text-sm overflow-x-auto'
        data-testing-id={props['data-testing-id']}
      >
        {text}
      </p>
    </motion.div>
  )
}
