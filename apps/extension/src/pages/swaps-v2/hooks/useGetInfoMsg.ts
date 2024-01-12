import { useMemo } from 'react'

export function useGetInfoMsg(count: number) {
  return useMemo(() => {
    if (count > 1) {
      return "This is a multi-step route, please navigate to Leap's web dashboard to complete the swap"
    }

    return ''
  }, [count])
}
