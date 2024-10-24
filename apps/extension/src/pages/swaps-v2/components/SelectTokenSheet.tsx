import { getKeyToUseForDenoms } from '@leapwallet/cosmos-wallet-hooks'
import { RootDenomsStore, WhitelistedFactoryTokensStore } from '@leapwallet/cosmos-wallet-store'
import { Question } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { SearchInput } from 'components/search-input'
import Fuse from 'fuse.js'
import { observer } from 'mobx-react-lite'
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { GroupedVirtuoso } from 'react-virtuoso'
import { SourceChain, SourceToken } from 'types/swap'
import { isSidePanel } from 'utils/isSidePanel'

import { TokenCard, TokenCardSkeleton } from './TokenCard'

const TokenCardWrapper = observer(
  ({
    tokensLength,
    index,
    token,
    selectedToken,
    selectedChain,
    onTokenSelect,
    verified,
    header,
    isChainAbstractionView,
  }: {
    index: number
    tokensLength: number
    selectedChain: SourceChain | undefined
    token: SourceToken
    verified: boolean
    onTokenSelect: (token: SourceToken) => void
    selectedToken: SourceToken | null
    header: ReactNode
    isChainAbstractionView?: boolean
  }) => {
    const isLast = index === tokensLength - 1
    const isFirst = index === 0

    const isSelected = useMemo(() => {
      let _isSelected =
        getKeyToUseForDenoms(token.skipAsset.denom, token.skipAsset.originChainId) ===
        getKeyToUseForDenoms(
          selectedToken?.skipAsset?.denom ?? '',
          selectedToken?.skipAsset?.originChainId ?? '',
        )

      if (token.ibcDenom !== undefined && selectedToken?.ibcDenom !== undefined) {
        _isSelected = _isSelected && token.ibcDenom === selectedToken.ibcDenom
      }
      return _isSelected
    }, [selectedToken, token])

    return (
      <>
        {isFirst ? header : null}

        <TokenCard
          onTokenSelect={onTokenSelect}
          token={token}
          hideAmount={token.amount === '0'}
          isSelected={isSelected}
          verified={verified}
          selectedChain={selectedChain}
          showRedirection={false}
          isChainAbstractionView={isChainAbstractionView}
        />

        {!isLast && <div className='border-b w-full border-gray-100 dark:border-gray-850' />}
      </>
    )
  },
)

type SelectTokenSheetProps = {
  sourceAssets: SourceToken[]
  destinationAssets: SourceToken[]
  sourceToken: SourceToken | null
  destinationToken: SourceToken | null
  isOpen: boolean
  onClose: () => void
  showFor: 'source' | 'destination' | ''
  selectedChain: SourceChain | undefined
  // eslint-disable-next-line no-unused-vars
  onTokenSelect: (token: SourceToken) => void
  rootDenomsStore: RootDenomsStore
  whitelistedFactorTokenStore: WhitelistedFactoryTokensStore
  isChainAbstractionView?: boolean
  loadingTokens: boolean
}

export function SelectTokenSheet({
  sourceAssets,
  sourceToken,
  destinationAssets,
  destinationToken,
  isOpen,
  onClose,
  showFor,
  onTokenSelect,
  selectedChain,
  isChainAbstractionView,
  loadingTokens,
}: SelectTokenSheetProps) {
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
    }
  }, [isOpen])

  const selectedToken = useMemo(() => {
    switch (showFor) {
      case 'source':
        return sourceToken

      case 'destination':
        return destinationToken

      default:
        return null
    }
  }, [showFor, sourceToken, destinationToken])

  const tokensToShow = useMemo(() => {
    switch (showFor) {
      case 'source':
        return sourceAssets

      case 'destination':
        return destinationAssets

      default:
        return []
    }
  }, [showFor, sourceAssets, destinationAssets])

  const fuse = useMemo(() => {
    const keys = ['symbol', 'name', 'coinMinimalDenom', 'ibcDenom']
    if (isChainAbstractionView) {
      keys.push('tokenBalanceOnChain', 'chain')
    }

    const options = {
      keys,
      threshold: 0.3,
      ignoreLocation: true,
    }
    return new Fuse(tokensToShow, options)
  }, [tokensToShow, isChainAbstractionView])

  const filteredTokens = useMemo(() => {
    if (searchQuery.length === 0) {
      return tokensToShow
    }

    const searchResult = fuse.search(searchQuery)
    return searchResult.map((result) => result.item)
  }, [searchQuery, tokensToShow, fuse])

  const tokenGroups = useMemo(() => {
    return [
      {
        type: 'whitelisted' as const,
        items: filteredTokens,
        Component: TokenCardWrapper,
        headerComponent: (
          <div
            key='all-tokens-heading'
            className='mb-[8px] flex flex-row justify-start items-center gap-[4px] text-gray-400'
          >
            <span className='font-bold text-xs'>All tokens</span>
          </div>
        ),
      },
    ]
  }, [filteredTokens])

  return (
    <BottomModal
      title='Select Token'
      onClose={onClose}
      isOpen={isOpen}
      closeOnBackdropClick={true}
      contentClassName='!bg-white-100 dark:!bg-gray-950 !overflow-hidden'
      className='p-6'
    >
      <div className='flex flex-col items-center w-full h-full'>
        <div className='flex flex-col items-center w-full h-full mb-6'>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testing-id='switch-token-input-search'
            placeholder={isChainAbstractionView ? 'Search Token or Chain' : 'Search Token'}
            onClear={() => setSearchQuery('')}
            divClassName='rounded-2xl w-full flex gap-[10px] bg-gray-50 dark:bg-gray-900 py-3 pr-3 pl-4 focus-within:border-green-600 border border-transparent'
            inputClassName='flex flex-grow text-base text-gray-400 outline-none bg-white-0 font-bold dark:text-white-100 text-md placeholder:font-medium dark:placeholder:text-gray-400  !leading-[21px]'
          />
        </div>

        <div
          className='w-full'
          style={{ height: (isSidePanel() ? window.innerHeight : 600) - 200, overflowY: 'scroll' }}
        >
          {loadingTokens ? (
            <>
              <div
                key='all-tokens-heading'
                className='mb-[8px] flex flex-row justify-start items-center gap-[4px] text-gray-400'
              >
                <span className='font-bold text-xs'>All tokens</span>
              </div>
              {[...Array(5)].map((_, index) => (
                <>
                  <TokenCardSkeleton key={index} />
                  {index !== 4 && (
                    <div className='border-b w-full border-gray-100 dark:border-gray-850' />
                  )}
                </>
              ))}
            </>
          ) : filteredTokens.length === 0 ? (
            <div className='py-[88px] w-full flex-col flex  justify-center items-center gap-4'>
              <Question size={40} className='!leading-[40px] dark:text-white-100' />
              <div className='flex flex-col justify-start items-center w-full gap-1'>
                <div className='text-md text-center font-bold !leading-[21.5px] dark:text-white-100'>
                  No tokens found for &apos;{searchQuery}&apos;
                </div>
                <div className='text-sm font-normal !leading-[22.4px] text-gray-400 dark:text-gray-400'>
                  Try searching for a different term
                </div>
              </div>
            </div>
          ) : (
            <>
              <GroupedVirtuoso
                style={{ flexGrow: '1', width: '100%' }}
                groupContent={() => <div className='w-[1px] h-[1px] bg-transparent'></div>} //This is to avoid virtuoso errors in console logs
                groupCounts={tokenGroups.map((group) => group.items.length)}
                itemContent={(index, groupIndex) => {
                  const group = tokenGroups[groupIndex]
                  const { Component } = group
                  const item = group.items[index]
                  return (
                    <Component
                      key={`${item.coinMinimalDenom}`}
                      index={index}
                      token={item}
                      verified={false}
                      selectedToken={selectedToken}
                      selectedChain={selectedChain}
                      onTokenSelect={onTokenSelect}
                      tokensLength={group.items.length}
                      header={group.headerComponent}
                      isChainAbstractionView={isChainAbstractionView}
                    />
                  )
                }}
              />
            </>
          )}
        </div>
      </div>
    </BottomModal>
  )
}
