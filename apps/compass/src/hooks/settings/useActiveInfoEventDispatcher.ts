import { isAptosChain } from '@leapwallet/cosmos-wallet-sdk'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useChainInfos } from 'hooks/useChainInfos'
import { useEffect, useRef } from 'react'
import { sendMessageToTab } from 'utils'

import { useActiveChain } from './useActiveChain'
import { useSelectedNetwork } from './useNetwork'

export function useActiveInfoEventDispatcher() {
  const chainInfos = useChainInfos()
  const activeChainInfoEventPromise = useRef<NodeJS.Timeout | null>(null)
  const activeNetwork = useSelectedNetwork()
  const activeChain = useActiveChain()

  useEffect(() => {
    async function dispatchActiveChainInfoChanged(chain: SupportedChain, network: string) {
      if (isAptosChain(chain)) {
        const chainInfo = chainInfos?.[chain]
        await sendMessageToTab({
          event: 'leap_activeChainInfoChanged',
          data: {
            chainId: network === 'testnet' ? chainInfo?.testnetChainId : chainInfo?.chainId,
            network: network,
            restUrl: network === 'testnet' ? chainInfo?.apis?.restTest : chainInfo?.apis?.rest,
            rpcUrl: network === 'testnet' ? chainInfo?.apis?.rpcTest : chainInfo?.apis?.rpc,
            chainKey: chain,
          },
        })
      }
    }
    if (activeChainInfoEventPromise.current) {
      clearTimeout(activeChainInfoEventPromise.current)
    }
    activeChainInfoEventPromise.current = setTimeout(
      () => dispatchActiveChainInfoChanged(activeChain, activeNetwork),
      250,
    )
    return () => {
      if (activeChainInfoEventPromise.current) {
        clearTimeout(activeChainInfoEventPromise.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChain, activeNetwork])
}
