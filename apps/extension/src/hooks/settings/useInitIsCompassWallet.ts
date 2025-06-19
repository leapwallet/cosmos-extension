import { useSetIsCompassWallet } from '@leapwallet/cosmos-wallet-hooks'
import { useEffect } from 'react'

export function useInitIsCompassWallet() {
  const setIsCompassWallet = useSetIsCompassWallet()

  useEffect(() => {
    setIsCompassWallet(false)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
