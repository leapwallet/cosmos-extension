import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks'
import { CaretRight, CaretUp } from '@phosphor-icons/react'
import { SideNavMenuOpen } from 'components/header/sidenav-menu'
import { TuneIcon } from 'icons/tune-icon'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { marketDataStore } from 'stores/balance-store'
import { chainInfoStore, compassTokensAssociationsStore } from 'stores/chain-infos-store'
import { hideSmallBalancesStore } from 'stores/hide-small-balances-store'
import { rootBalanceStore } from 'stores/root-store'

import { AssetCard } from './index'

const maxAssets = 10

export const ListTokens = observer(() => {
  const [showMaxAssets, setShowMaxAssets] = useState(false)
  const activeWallet = useActiveWallet()
  const allTokens = rootBalanceStore.allTokens

  const assetsToShow = useMemo(() => {
    const truncatedAssets =
      showMaxAssets || allTokens.length < maxAssets ? allTokens : allTokens?.slice(0, maxAssets)

    if (hideSmallBalancesStore.isHidden) {
      return truncatedAssets.filter((asset) => Number(asset.usdValue) > 0.1)
    }

    return truncatedAssets
  }, [allTokens, showMaxAssets, hideSmallBalancesStore.isHidden])

  const atLeastOneTokenHasSmallBalance = useMemo(() => {
    return allTokens.some((asset) => Number(asset.usdValue) < 0.1)
  }, [allTokens])

  const TextElementToShow = useMemo(() => {
    const assetsLength = hideSmallBalancesStore.isHidden
      ? allTokens.filter((asset) => Number(asset.usdValue) > 0.1).length
      : allTokens.length

    if (assetsLength <= maxAssets) {
      return null
    }

    if (showMaxAssets) {
      return (
        <>
          <CaretUp size={16} weight='bold' className='mr-1.5' />
          <span>Collapse</span>
        </>
      )
    }

    return (
      <>
        <CaretRight size={16} weight='bold' className='mr-1.5' />
        <span>View {assetsLength - maxAssets} more tokens</span>
      </>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTokens, showMaxAssets, hideSmallBalancesStore.isHidden])

  const handleTextElementClick = useCallback(() => {
    setShowMaxAssets((prev) => !prev)
  }, [])

  return (
    <div className={'w-full flex flex-col items-center justify-center gap-3'}>
      {assetsToShow.map((asset) => (
        <AssetCard
          key={asset.symbol}
          asset={asset}
          marketDataStore={marketDataStore}
          compassTokensAssociationsStore={compassTokensAssociationsStore}
          chainInfosStore={chainInfoStore}
        />
      ))}

      <div className='flex items-center justify-between w-full text-secondary-600 py-3'>
        {TextElementToShow ? (
          <button
            className='flex items-center justify-center text-sm font-bold'
            onClick={handleTextElementClick}
          >
            {TextElementToShow}
          </button>
        ) : null}

        {!activeWallet?.watchWallet && (
          <Link to={'/manage-tokens'} title='Manage Tokens' className='ml-auto'>
            <TuneIcon className='size-6 text-secondary-600 hover:text-secondary-800 transition-colors' />
          </Link>
        )}
      </div>

      {hideSmallBalancesStore.isHidden && atLeastOneTokenHasSmallBalance ? (
        <p className='text-xs px-4 font-bold text-muted-foreground text-center'>
          Tokens with small balances hidden (&lt;$0.1).
          <br /> Customize settings{' '}
          <SideNavMenuOpen className='inline underline'>here</SideNavMenuOpen>.
        </p>
      ) : null}
    </div>
  )
})
