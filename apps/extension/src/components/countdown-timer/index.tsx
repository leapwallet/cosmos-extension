import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'

interface ICountdown {
  minutes: number
  seconds: number
  setRevealed: Dispatch<SetStateAction<boolean>>
  setPassword: Dispatch<SetStateAction<string>>
}

export default function CountDownTimer({
  minutes = 0,
  seconds = 0,
  setRevealed,
  setPassword,
}: ICountdown) {
  const [time, setTime] = useState<ICountdown>({ minutes, seconds, setRevealed, setPassword })
  const tick = () => {
    if (time.minutes === 0 && time.seconds === 0) {
      setRevealed(false)
      setPassword('')
      // reset()
    } else if (time.seconds === 0) {
      setTime({ minutes: time.minutes - 1, seconds: 59, setRevealed, setPassword })
    } else {
      setTime({ minutes: time.minutes, seconds: time.seconds - 1, setRevealed, setPassword })
    }
  }

  // const reset = () => setTime({minutes: time.minutes, seconds: time.seconds});

  useEffect(() => {
    const timerId = setInterval(() => tick(), 1000)
    return () => clearInterval(timerId)
  }, [time, setTime])

  return (
    <span className='text-gray-200 font-bold text-xs'>{`${time.minutes
      .toString()
      .padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`}</span>
  )
}
