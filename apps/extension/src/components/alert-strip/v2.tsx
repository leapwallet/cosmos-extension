import { CheckCircle, Info, Warning, WarningCircle } from '@phosphor-icons/react'
import { Variants } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { cn } from 'utils/cn'

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
  success: {
    className: 'bg-accent-success text-accent-success-foreground',
    Icon: CheckCircle,
    weight: 'fill',
  },
} as const

export const alertStripVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const AlertStrip = (props: {
  type?: 'info' | 'warning' | 'error' | 'success'
  className?: string
  timeOut?: number
  onHide?: VoidFunction
  children: React.ReactNode
  iconClassName?: string
}) => {
  const { className, Icon, weight } =
    alertStripV2Config[props.type ?? 'info'] || alertStripV2Config.info

  const [show, setShow] = useState(true)

  useEffect(() => {
    if (!props.timeOut) {
      return
    }

    const timeout = setTimeout(() => {
      setShow(false)
      props.onHide?.()
    }, props.timeOut)

    return () => clearTimeout(timeout)
  }, [props])

  if (!show) {
    return null
  }

  return (
    <div
      className={cn(
        'w-full flex justify-center items-center gap-2 p-2 text-xs font-bold',
        className,
        props.className,
      )}
    >
      <Icon weight={weight} className={cn('size-4 shrink-0', props.iconClassName)} />
      <p>{props.children}</p>
    </div>
  )
}
