import { CWTx } from '@leapwallet/cosmos-wallet-sdk'
import { useCallback } from 'react'

import { useActiveChain } from '../settings/useActiveChain'
import { useSelectedNetwork } from '../settings/useNetwork'
import { Wallet } from '../wallet/useWallet'
import useGetWallet = Wallet.useGetWallet
import useActiveWallet from '../settings/useActiveWallet'
import { useRpcUrl } from '../settings/useRpcUrl'

export function useCWTxHandler() {
  const selectedNetwork = useSelectedNetwork()
  const activeChain = useActiveChain()
  const getWallet = useGetWallet()
  const { rpcUrl } = useRpcUrl()
  const activeWallet = useActiveWallet()

  return useCallback(async () => {
    const wallet = await getWallet()

    const _tx = new CWTx(`${rpcUrl}/`, wallet)
    await _tx.initClient()
    return _tx

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChain, getWallet, selectedNetwork, activeWallet])
}
