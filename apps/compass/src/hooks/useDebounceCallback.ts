/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'

export function useDebounceCallback() {
  const [timeoutId, setTimeoutId] = useState<number | null>(null)

  const debounce = (callback: any, delay: number) => {
    return (...args: any) => {
      timeoutId && clearTimeout(timeoutId)

      const newTimeoutId = setTimeout(() => {
        callback(...args)
      }, delay)

      setTimeoutId(newTimeoutId as unknown as number)
    }
  }

  return { debounce }
}
