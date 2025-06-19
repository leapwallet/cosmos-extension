import { Token, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { isAptosChain } from '@leapwallet/cosmos-wallet-sdk'
import { generateRandomString } from '@leapwallet/cosmos-wallet-store'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { percentageChangeDataStore } from 'stores/balance-store'
import { chainInfoStore } from 'stores/chain-infos-store'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { AggregatedSupportedChain } from 'types/utility'

import { AssetCard } from './AssetCard'

export const NativeTokenPlaceholder = observer(() => {
  const chains = useGetChains()
  const activeChain = useActiveChain() as AggregatedSupportedChain

  const emptyNativeTokens = useMemo(() => {
    if (activeChain === AGGREGATED_CHAIN_KEY || !chains) {
      return null
    }

    const chainInfo = chains[activeChain]

    const nativeDenoms = Object.keys(chainInfo.nativeDenoms)
    if (isAptosChain(activeChain)) {
      const nativeDenom = nativeDenoms?.[0]
      const denom = rootDenomsStore.allDenoms[nativeDenom]
      if (!denom) {
        return null
      }
      return [
        {
          ...denom,
          amount: '0',
          symbol: denom.coinDenom,
          img: denom.icon,
          chain: activeChain,
          tokenBalanceOnChain: activeChain,
          id: generateRandomString(10),
        },
      ]
    }

    return nativeDenoms.map((item): Token & { id: string } => {
      const denom = rootDenomsStore.allDenoms[item]
      return {
        ...denom,
        amount: '0',
        symbol: denom.coinDenom ?? denom.name,
        img: denom.icon,
        chain: denom.chain ?? chainInfo.key,
        tokenBalanceOnChain: chainInfo.key,
        id: generateRandomString(10),
      }
    })
  }, [activeChain, chains])

  return (
    <div className='flex flex-col w-full px-5 pb-20'>
      <div className={'w-full flex flex-col items-center justify-center gap-3'}>
        {emptyNativeTokens?.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            percentageChangeDataStore={percentageChangeDataStore}
            chainInfosStore={chainInfoStore}
            isPlaceholder
          />
        ))}
      </div>
    </div>
  )
})
