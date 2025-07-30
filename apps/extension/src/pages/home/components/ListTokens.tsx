import { Token } from '@leapwallet/cosmos-wallet-hooks'
import { CaretRight, CaretUp, MagnifyingGlassMinus } from '@phosphor-icons/react'
import { SideNavMenuOpen } from 'components/header/sidenav-menu'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { percentageChangeDataStore } from 'stores/balance-store'
import { chainInfoStore } from 'stores/chain-infos-store'
import { hideSmallBalancesStore } from 'stores/hide-small-balances-store'

import { AssetCard, tokenHasBalance } from './index'

const maxAssets = 10

const sideNavDefaults = { openTokenDisplayPage: true }

export const ListTokens = observer(
  ({
    allTokens,
    searchQuery,
    balanceError,
  }: {
    allTokens: Token[]
    searchQuery: string
    balanceError: boolean
  }) => {
    const [showMaxAssets, setShowMaxAssets] = useState(false)

    const assetsToShow = useMemo(() => {
      let truncatedAssets =
        searchQuery || showMaxAssets || allTokens.length < maxAssets
          ? allTokens
          : allTokens?.slice(0, maxAssets)

      if (searchQuery) {
        truncatedAssets = truncatedAssets.filter(
          (asset) =>
            asset.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.name?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      }

      if (hideSmallBalancesStore.isHidden) {
        return truncatedAssets.filter((asset) => Number(asset.usdValue) > 0.1)
      }

      return truncatedAssets
    }, [allTokens, showMaxAssets, hideSmallBalancesStore.isHidden, searchQuery])

    const atLeastOneTokenHasSmallBalance = useMemo(() => {
      return allTokens.some((asset) => Number(asset.usdValue) < 0.1)
    }, [allTokens])

    return (
      <div className={'w-full flex flex-col items-center justify-center gap-3'}>
        {assetsToShow.map((asset: Token) => (
          <AssetCard
            key={(asset as Token & { id: string })?.id}
            asset={asset}
            percentageChangeDataStore={percentageChangeDataStore}
            chainInfosStore={chainInfoStore}
            isPlaceholder={balanceError && !tokenHasBalance(asset)}
          />
        ))}

        {searchQuery && assetsToShow.length === 0 && (
          <div className='w-full flex items-center justify-center h-[276px] bg-secondary-100 rounded-2xl border border-secondary-200'>
            <div className='flex items-center justify-center flex-col gap-4'>
              <div className='p-5 bg-secondary-200 rounded-full flex items-center justify-center'>
                <MagnifyingGlassMinus size={24} className='text-foreground' />
              </div>
              <p className='text-[18px] !leading-[24px] font-bold text-foreground text-center'>
                No tokens found
              </p>
            </div>
          </div>
        )}

        {allTokens.length > maxAssets && (
          <TextElementToShow
            allTokens={allTokens}
            showMaxAssets={showMaxAssets}
            searchQuery={searchQuery}
            setShowMaxAssets={setShowMaxAssets}
          />
        )}

        {hideSmallBalancesStore.isHidden && atLeastOneTokenHasSmallBalance && (
          <p className='text-xs px-4 font-bold text-muted-foreground text-center'>
            Tokens with small balances hidden (&lt;$0.1).
            <br /> Customize settings{' '}
            <SideNavMenuOpen className='inline underline' sideNavDefaults={sideNavDefaults}>
              here
            </SideNavMenuOpen>
            .
          </p>
        )}
      </div>
    )
  },
)

const TextElementToShow = ({
  allTokens,
  showMaxAssets,
  searchQuery,
  setShowMaxAssets,
}: {
  allTokens: Token[]
  showMaxAssets: boolean
  searchQuery: string
  setShowMaxAssets: (value: boolean) => void
}) => {
  const assetsLength = hideSmallBalancesStore.isHidden
    ? allTokens.filter((asset) => Number(asset.usdValue) > 0.1).length
    : allTokens.length

  if (searchQuery || assetsLength <= maxAssets) {
    return null
  }

  if (showMaxAssets) {
    return (
      <button
        className='flex items-center text-sm font-bold w-full text-muted-foreground hover:text-foreground py-3.5 transition-colors'
        onClick={() => setShowMaxAssets(!showMaxAssets)}
      >
        <CaretUp size={16} weight='bold' className='mr-1.5' />
        <span>Collapse</span>
      </button>
    )
  }

  return (
    <button
      className='flex items-center text-sm font-bold w-full text-muted-foreground hover:text-foreground py-3.5 transition-colors'
      onClick={() => setShowMaxAssets(!showMaxAssets)}
    >
      <CaretRight size={16} weight='bold' className='mr-1.5' />
      <span>View {assetsLength - maxAssets} more tokens</span>
    </button>
  )
}
