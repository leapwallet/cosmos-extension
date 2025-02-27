import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useEffect, useRef } from 'react'
import { AggregatedSupportedChain } from 'types/utility'

export const useHandleInitialAnimation = (activeChain: AggregatedSupportedChain) => {
  const initialRef = useRef<Record<string, never | number>>(
    [AGGREGATED_CHAIN_KEY, 'seiTestnet2'].includes(activeChain) ? {} : { opacity: 0, y: 50 },
  )
  useEffect(() => {
    const timeoutMilliSecond = [AGGREGATED_CHAIN_KEY, 'seiTestnet2'].includes(activeChain) ? 0 : 300
    const timeoutId = setTimeout(() => {
      initialRef.current = {}
    }, timeoutMilliSecond)

    return () => clearTimeout(timeoutId)
  }, [activeChain])
  return initialRef
}
