import { useSetIsCompassWallet } from '@leapwallet/cosmos-wallet-hooks'
import { useEffect } from 'react'

export function useInitIsCompassWallet() {
  const setIsCompassWallet = useSetIsCompassWallet()

  useEffect(() => {
    setIsCompassWallet(true)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
