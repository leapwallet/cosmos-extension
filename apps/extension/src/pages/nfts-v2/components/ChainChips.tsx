import { NftStore } from '@leapwallet/cosmos-wallet-store'
import classNames from 'classnames'
import { useFavNFTs, useHiddenNFTs } from 'hooks/settings'
import React, { ReactNode, useLayoutEffect, useMemo } from 'react'
import { nftStore } from 'stores/nft-store'

import { useNftContext } from '../context'
import { Chip } from './index'

type ChainChipProps = {
  title: string
  isActive: boolean
  onClick: VoidFunction
  children?: ReactNode
}

function ChainChip({ isActive, title, children, onClick }: ChainChipProps) {
  return (
    <Chip
      className={classNames(
        'cursor-pointer border border-gray-100 dark:border-gray-800 py-[8px] px-[14px] mr-3',
        {
          'bg-gray-100 dark:bg-white-100': isActive,
          'px-[18px]': children,
        },
      )}
      onClick={onClick}
    >
      {children}

      <Chip.Text
        className={classNames('text-gray-800 text-sm', {
          'dark:text-black-100': isActive,
          'dark:text-gray-300': !isActive,
        })}
      >
        {title}
      </Chip.Text>
    </Chip>
  )
}

type ChainChipsProps = {
  // eslint-disable-next-line no-unused-vars
  handleTabClick: (selectedTab: string) => void
  nftStore: NftStore
}

export function ChainChips({ handleTabClick }: ChainChipsProps) {
  const hiddenNfts = useHiddenNFTs()
  const favNfts = useFavNFTs()
  const { activeTab, setActiveTab } = useNftContext()
  const _collectionData = nftStore.getVisibleCollectionData(hiddenNfts)

  const chips = useMemo(() => {
    const _chips = ['All']

    if (_collectionData?.collections) {
      if (favNfts.length) {
        _chips.push('Favorites')
      }

      _chips.push('Collections')

      if (hiddenNfts.length) {
        _chips.push('Hidden')
      }
    }

    return _chips
  }, [_collectionData?.collections, favNfts.length, hiddenNfts.length])

  useLayoutEffect(() => {
    if (!chips.includes(activeTab)) {
      setActiveTab('All')
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, chips])

  return (
    <div className='flex overflow-auto whitespace-nowrap scroll-smooth mb-4'>
      {chips.map((title) => {
        return (
          <ChainChip
            key={title}
            isActive={activeTab === title}
            title={title}
            onClick={() => handleTabClick(title)}
          />
        )
      })}
    </div>
  )
}
