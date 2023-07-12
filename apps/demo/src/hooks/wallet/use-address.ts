import { useMemo } from 'react'

import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { useActiveWallet } from '~/hooks/wallet/use-wallet'

export function useAddress() {
  const chain = useActiveChain()
  const wallet = useActiveWallet()

  return useMemo(() => wallet.addresses[chain], [chain, wallet.addresses])
}
