import { useSetIsCompassWallet } from '@leapwallet/cosmos-wallet-hooks'
import { useEffect } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

export function useInitIsCompassWallet() {
  const setIsCompassWallet = useSetIsCompassWallet()

  useEffect(() => {
    setIsCompassWallet(isCompassWallet())

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
