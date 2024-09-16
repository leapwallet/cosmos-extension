import {
  Token,
  useGetChains,
  useIsSeiEvmChain,
  useSeiLinkedAddressState,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { EvmBalanceStore, RootBalanceStore } from '@leapwallet/cosmos-wallet-store'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import classNames from 'classnames'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { Wallet } from 'hooks/wallet/useWallet'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo, useState } from 'react'
import { AggregatedSupportedChain } from 'types/utility'

import { AssetCard } from './index'

export function ListView({ assets }: { assets: Token[] }) {
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {assets.map((asset: any) => (
        <AssetCard key={asset.id} asset={asset} style={{ marginBottom: 16 }} />
      ))}
    </>
  )
}

export const ListTokens = observer(
  ({
    balances: { allTokens },
    evmBalances,
  }: {
    balances: RootBalanceStore
    evmBalances: EvmBalanceStore
  }) => {
    const [showMaxAssets, setShowMaxAssets] = useState<number | 'all'>(10)
    const activeChain = useActiveChain() as AggregatedSupportedChain
    const getWallet = Wallet.useGetWallet()
    const { addressLinkState } = useSeiLinkedAddressState(
      getWallet,
      activeChain === AGGREGATED_CHAIN_KEY ? 'seiTestnet2' : undefined,
    )
    const chains = useGetChains()
    const evmBalance = evmBalances.evmBalance
    const isEvmOnlyChain = chains?.[activeChain as SupportedChain]?.evmOnlyChain
    const isSeiEvmChain = useIsSeiEvmChain(
      activeChain === AGGREGATED_CHAIN_KEY ? 'seiTestnet2' : activeChain,
    )

    allTokens = useMemo(() => {
      if (isSeiEvmChain && !['done', 'unknown'].includes(addressLinkState)) {
        const firstElement = allTokens?.[0]

        if (firstElement) {
          return [firstElement, ...(evmBalance?.evmBalance ?? []), ...(allTokens ?? []).slice(1)]
        } else {
          return [...(evmBalance?.evmBalance ?? []), ...(allTokens ?? []).slice(1)]
        }
      }

      if (isEvmOnlyChain) {
        return [...(allTokens ?? []), ...(evmBalance?.evmBalance ?? [])]
      }

      return allTokens
    }, [addressLinkState, allTokens, evmBalance?.evmBalance, isEvmOnlyChain, isSeiEvmChain])

    const assetsToShow = useMemo(() => {
      return showMaxAssets === 'all' || allTokens.length < 10
        ? allTokens
        : allTokens?.slice(0, showMaxAssets)
    }, [allTokens, showMaxAssets])

    const TextElementToShow = useMemo(() => {
      const assetsLength = allTokens.length

      if (assetsLength > 10) {
        switch (showMaxAssets) {
          case 'all':
            return (
              <>
                <span>Collapse</span>
                <CaretUp size={16} className='text-gray-600 dark:text-gray-400 ml-2' />
              </>
            )

          default:
            return (
              <>
                <span>View {assetsLength - showMaxAssets} more tokens</span>
                <CaretDown size={16} className='text-gray-600 dark:text-gray-400 ml-2' />
              </>
            )
        }
      }

      return null
    }, [allTokens?.length, showMaxAssets])

    const handleTextElementClick = useCallback(() => {
      switch (showMaxAssets) {
        case 'all':
          setShowMaxAssets(10)
          break

        default:
          setShowMaxAssets('all')
          break
      }
    }, [showMaxAssets])

    return (
      <div
        className={classNames({
          'w-full flex flex-col items-center justify-center': !!TextElementToShow,
        })}
      >
        <ListView assets={assetsToShow} />
        {TextElementToShow ? (
          <button
            className='flex items-center justify-center text-gray-600 dark:text-gray-400 text-[14px] font-bold'
            onClick={handleTextElementClick}
          >
            {TextElementToShow}
          </button>
        ) : null}
      </div>
    )
  },
)
