import { useEffect, useRef, useState } from 'react'

/**
 * Hook to keep track of the previous value of a state.
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const [prevVal, setPrevVal] = useState<T>()
  const ref = useRef<T>()

  useEffect(() => {
    setPrevVal(ref.current)
    ref.current = value
  }, [value])

  return prevVal
}

export default usePrevious
