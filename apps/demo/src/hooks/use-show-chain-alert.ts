import { useEffect, useState } from 'react'

import { useActiveChain } from '~/hooks/settings/use-active-chain'

export const useShowChainAlert = () => {
  const activeChain = useActiveChain()
  const [showChainAlert, setShowChainAlert] = useState(true)

  useEffect(() => {
    setShowChainAlert(true)

    const t = setTimeout(() => {
      setShowChainAlert(false)
    }, 10000)

    return () => {
      clearTimeout(t)
    }
  }, [activeChain])

  return showChainAlert
}
