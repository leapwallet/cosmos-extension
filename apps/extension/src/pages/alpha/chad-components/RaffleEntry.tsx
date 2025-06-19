import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { cn } from 'utils/cn'

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const transition = { duration: 0.2, ease: 'easeOut' }

const CardWrapper = ({
  primary = false,
  children,
  className,
}: {
  primary?: boolean
  children: React.ReactNode
  className?: string
}) => {
  return (
    <motion.div
      initial='hidden'
      animate='visible'
      exit='exit'
      variants={cardVariants}
      transition={transition}
      className={cn(
        'rounded-lg p-5 flex flex-col items-center gap-3 border border-secondary-200',
        primary ? 'gradient-linear-primary' : 'gradient-linear-mono',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

const CountdownItem = ({ label, value }: { label: string; value: number }) => {
  return (
    <div className='flex flex-col items-center gap-1'>
      <div className='w-14 h-12 flex text-lg items-center justify-center rounded-lg font-bold bg-primary/40 border border-primary'>
        {String(value).padStart(2, '0')}
      </div>
      <span className='text-xs'>{label}</span>
    </div>
  )
}

interface CountdownProps {
  title: string
  endDate: string
  onExpire?: () => void
}

export function SubscriptionCountdown({ title, endDate, onExpire }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = dayjs()
      const end = dayjs(endDate)
      const diff = end.diff(now, 'second')
      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        onExpire?.()
        return
      }

      const days = Math.floor(diff / (24 * 60 * 60))
      const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((diff % (60 * 60)) / 60)
      const seconds = Math.floor(diff % 60)

      setTimeRemaining({ days, hours, minutes, seconds })
    }

    calculateTimeRemaining()
    const timerId = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(timerId)
  }, [endDate, onExpire])

  const { days, hours, minutes, seconds } = timeRemaining

  return (
    <CardWrapper primary>
      <span className='text-secondary-800 text-sm'>{title}</span>

      <div className='flex justify-center gap-3'>
        <CountdownItem label='D' value={days} />
        <CountdownItem label='H' value={hours} />
        <CountdownItem label='M' value={minutes} />
        <CountdownItem label='S' value={seconds} />
      </div>
    </CardWrapper>
  )
}

export function IneligibleRaffle() {
  return (
    <CardWrapper>
      <span className='text-secondary-800 text-sm'>You&apos;re not a Leap Chad yet</span>
      <span className='text-lg font-bold text-center'>
        We&apos;ll notify you when you are eligible
      </span>
    </CardWrapper>
  )
}

export function ResultSoon() {
  return (
    <CardWrapper>
      <span className='text-secondary-800 text-sm'>Giveaway has ended</span>
      <span className='text-lg font-bold text-center'>Results will be declared soon</span>
    </CardWrapper>
  )
}

export function RaffleWinner({ rewardUnit }: { rewardUnit?: string }) {
  return (
    <CardWrapper primary>
      <span className='text-secondary-800 text-sm'>Congratulations!</span>
      <span className='text-lg font-bold text-center'>You&apos;ve won {rewardUnit}!</span>
    </CardWrapper>
  )
}

export function NotRaffleWinner() {
  return (
    <CardWrapper>
      <span className='text-secondary-800 text-sm'>You did not win</span>
      <span className='text-lg font-bold text-center'>Better luck next time</span>
    </CardWrapper>
  )
}

export function RaffleClosed() {
  return (
    <CardWrapper>
      <span className='text-secondary-800 text-sm'>You did not win</span>
      <span className='text-lg font-bold text-center'>Better luck next time</span>
    </CardWrapper>
  )
}

export function RaffleEntrySkeleton() {
  return (
    <motion.div
      initial='hidden'
      animate='visible'
      exit='exit'
      variants={cardVariants}
      transition={transition}
      className='relative rounded-xl'
    >
      <Skeleton className='w-full' height={100} borderRadius={20} />
    </motion.div>
  )
}
