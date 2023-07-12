import { InjectiveTx, Tx } from '@leapwallet/cosmos-wallet-sdk'
import { useCallback } from 'react'

import { useActiveChain } from '../settings/useActiveChain'
import { useSelectedNetwork } from '../settings/useNetwork'
import { useRpcUrl } from '../settings/useRpcUrl'
import { Wallet } from '../wallet/useWallet'

import useGetWallet = Wallet.useGetWallet
import { useGetChains } from '@leapwallet/cosmos-wallet-hooks'

export function useTxHandler() {
  const selectedNetwork = useSelectedNetwork()
  const activeChain = useActiveChain()
  const getWallet = useGetWallet()
  const { rpcUrl } = useRpcUrl()
  const chainInfos = useGetChains()

  return useCallback(async () => {
    const wallet = await getWallet()
    if (activeChain === 'injective') {
      return new InjectiveTx(
        selectedNetwork === 'testnet',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        wallet,
        selectedNetwork === 'testnet'
          ? chainInfos.injective.apis.restTest
          : chainInfos.injective.apis.rest,
      )
    } else {
      const _tx = new Tx(`${rpcUrl}/`, wallet)
      await _tx.initClient()
      return _tx
    }
  }, [
    getWallet,
    activeChain,
    selectedNetwork,
    chainInfos.injective.apis.restTest,
    chainInfos.injective.apis.rest,
    rpcUrl,
  ])
}
