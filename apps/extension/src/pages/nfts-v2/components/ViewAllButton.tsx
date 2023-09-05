import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import { useChainInfos } from 'hooks/useChainInfos'
import React from 'react'
import { Colors } from 'theme/colors'

export function ViewAllButton({ onClick }: { onClick: VoidFunction }) {
  const activeChain = useActiveChain()
  const chainInfos = useChainInfos()

  return (
    <button
      className='col-span-2 font-bold'
      style={{
        color: Colors.getChainColor(activeChain, chainInfos[activeChain]),
      }}
      onClick={onClick}
    >
      View all
    </button>
  )
}
