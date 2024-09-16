import { RootDenomsStore, WhitelistedFactoryTokensStore } from '@leapwallet/cosmos-wallet-store'
import { Question, SealCheck, WarningCircle } from '@phosphor-icons/react'
import classNames from 'classnames'
import BottomModal from 'components/bottom-modal'
import { SearchInput } from 'components/search-input'
import { observer } from 'mobx-react-lite'
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { GroupedVirtuoso } from 'react-virtuoso'
import { SourceChain, SourceToken } from 'types/swap'

import { TokenCard } from './TokenCard'

const TokenCardWrapper = observer(
  ({
    tokensLength,
    index,
    token,
    selectedToken,
    selectedChain,
    onTokenSelect,
    header,
  }: {
    index: number
    tokensLength: number
    selectedChain: SourceChain | undefined
    token: SourceToken
    onTokenSelect: (token: SourceToken) => void
    selectedToken: SourceToken | null
    header: ReactNode
  }) => {
    const isLast = index === tokensLength - 1
    const isFirst = index === 0

    const isSelected = useMemo(() => {
      let _isSelected = token.coinMinimalDenom === selectedToken?.coinMinimalDenom

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
          verified={true}
          selectedChain={selectedChain}
          showRedirection={false}
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
  rootDenomsStore,
  whitelistedFactorTokenStore,
}: SelectTokenSheetProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const baseDenoms = rootDenomsStore.allDenoms
  const whitelistedFactoryTokens = whitelistedFactorTokenStore.allWhitelistedFactoryTokens

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

  const filteredTokens = useMemo(() => {
    if (searchQuery.length === 0) {
      return tokensToShow
    }

    return tokensToShow.filter((token) => {
      return [
        token.symbol.toLowerCase(),
        (token.name ?? '').toLowerCase(),
        token.coinMinimalDenom.toLowerCase(),
        (token.ibcDenom ?? '').toLowerCase(),
      ].some((str) => str.includes(searchQuery.trim().toLowerCase()))
    })
  }, [searchQuery, tokensToShow])

  const baseTokensList = useMemo(
    () => Object.values(baseDenoms)?.map((token) => token.coinMinimalDenom),
    [baseDenoms],
  )

  const isWhiteListedToken = useCallback(
    (token: SourceToken) => {
      if (!baseTokensList?.includes(token.coinMinimalDenom)) {
        return false
      }
      if (token.coinMinimalDenom.startsWith('factory/')) {
        return whitelistedFactoryTokens?.[token.coinMinimalDenom]
      }

      return true
    },
    [whitelistedFactoryTokens, baseTokensList],
  )

  const tokenGroups = useMemo(() => {
    const _unverifiedTokens: SourceToken[] = []
    const _whitelistedTokens: SourceToken[] = []

    filteredTokens.forEach((token) => {
      if (isWhiteListedToken(token)) {
        _whitelistedTokens.push(token)
      } else {
        _unverifiedTokens.push(token)
      }
    })

    return [
      {
        type: 'whitelisted' as const,
        items: _whitelistedTokens,
        Component: TokenCardWrapper,
        headerComponent: (
          <div className='mb-[8px] flex flex-row justify-start items-center gap-[4px] text-gray-400'>
            <SealCheck size={16} weight='bold' className='!leading-[20px]' />
            <span className='font-bold text-xs'>Whitelisted tokens</span>
          </div>
        ),
      },
      {
        type: 'unverified' as const,
        items: _unverifiedTokens,
        Component: TokenCardWrapper,
        headerComponent: (
          <div
            className={classNames(
              'mb-[8px] flex flex-row justify-start items-center gap-[4px] text-gray-400',
              {
                'mt-4': _whitelistedTokens.length > 0,
              },
            )}
          >
            <WarningCircle size={16} className='!leading-[20px] !text-md' />
            <span className='font-bold text-xs'>Unverified tokens</span>
          </div>
        ),
      },
    ]
  }, [filteredTokens, isWhiteListedToken])

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
            placeholder='Search Token'
            onClear={() => setSearchQuery('')}
            divClassName='rounded-2xl w-full flex gap-[10px] bg-gray-50 dark:bg-gray-900 py-3 pr-3 pl-4 focus-within:border-green-600 border border-transparent'
            inputClassName='flex flex-grow text-base text-gray-400 outline-none bg-white-0 font-bold dark:text-white-100 text-md placeholder:font-medium dark:placeholder:text-gray-400  !leading-[21px]'
          />
        </div>

        <div className='w-full' style={{ height: window.innerHeight - 200, overflowY: 'scroll' }}>
          {filteredTokens.length === 0 ? (
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
                  if (group.type === 'whitelisted') {
                    const { Component } = group
                    const item = group.items[index]
                    return (
                      <Component
                        key={`${item.coinMinimalDenom}`}
                        index={index}
                        token={item}
                        selectedToken={selectedToken}
                        selectedChain={selectedChain}
                        onTokenSelect={onTokenSelect}
                        tokensLength={group.items.length}
                        header={group.headerComponent}
                      />
                    )
                  }

                  const { Component } = group
                  const effectiveIndex = index - tokenGroups[0].items.length
                  const item = group.items[effectiveIndex]

                  return (
                    <Component
                      index={effectiveIndex}
                      key={`${item?.coinMinimalDenom ?? effectiveIndex}`}
                      token={item}
                      selectedToken={selectedToken}
                      selectedChain={selectedChain}
                      onTokenSelect={onTokenSelect}
                      tokensLength={group.items.length}
                      header={group.headerComponent}
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
