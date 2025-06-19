import { getKeyToUseForDenoms, useSelectedNetwork } from '@leapwallet/cosmos-wallet-hooks'
import {
  MarketDataStore,
  RootDenomsStore,
  WhitelistedFactoryTokensStore,
} from '@leapwallet/cosmos-wallet-store'
import { MagnifyingGlassMinus } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { SearchInput } from 'components/ui/input/search-input'
import { EventName } from 'config/analytics'
import Fuse from 'fuse.js'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { GroupedVirtuoso } from 'react-virtuoso'
import { marketDataStore } from 'stores/balance-store'
import { compassTokenTagsStore } from 'stores/denoms-store-instance'
import { SourceChain, SourceToken } from 'types/swap'

import { useSwapContext } from '../context'
import { SelectDestinationSheet } from './SelectDestinationSheet'
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
    isChainAbstractionView,
    marketDataStore,
  }: {
    index: number
    tokensLength: number
    selectedChain: SourceChain | undefined
    token: SourceToken
    verified: boolean
    onTokenSelect: (token: SourceToken) => void
    selectedToken: SourceToken | null
    isChainAbstractionView?: boolean
    marketDataStore: MarketDataStore
  }) => {
    const isLast = index === tokensLength - 1

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
        <TokenCard
          onTokenSelect={onTokenSelect}
          token={token}
          hideAmount={token.amount === '0'}
          isSelected={isSelected}
          verified={verified}
          selectedChain={selectedChain}
          showRedirection={false}
          isChainAbstractionView={isChainAbstractionView}
          marketDataStore={marketDataStore}
        />

        {!isLast && <div className='border-b mx-6 border-gray-100 dark:border-gray-850' />}
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
  const activeNetwork = useSelectedNetwork()
  const { chainsToShow } = useSwapContext()

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
        return sourceAssets.filter(
          (asset) =>
            getKeyToUseForDenoms(asset.skipAsset.denom, asset.skipAsset.originChainId) !==
            getKeyToUseForDenoms(
              sourceToken?.skipAsset?.denom ?? '',
              sourceToken?.skipAsset?.originChainId ?? '',
            ),
        )

      case 'destination':
        return destinationAssets.filter(
          (asset) =>
            getKeyToUseForDenoms(asset.skipAsset.denom, asset.skipAsset.originChainId) !==
            getKeyToUseForDenoms(
              destinationToken?.skipAsset?.denom ?? '',
              destinationToken?.skipAsset?.originChainId ?? '',
            ),
        )

      default:
        return []
    }
  }, [showFor, sourceAssets, destinationAssets, sourceToken, destinationToken])

  const simpleFuse = useMemo(() => {
    const keys = ['symbol', 'name']
    if (isChainAbstractionView) {
      keys.push('tokenBalanceOnChain', 'chain')
    }
    const fuseOptions = {
      keys,
      threshold: 0.3,
      ignoreLocation: true,
    }
    return new Fuse(tokensToShow, fuseOptions)
  }, [tokensToShow, isChainAbstractionView])

  const extendedFuse = useMemo(() => {
    const keys = [
      'symbol',
      'name',
      'coinMinimalDenom',
      'ibcDenom',
      'skipAsset.evmTokenContract',
      'skipAsset.denom',
    ]
    if (isChainAbstractionView) {
      keys.push('tokenBalanceOnChain', 'chain')
    }
    const fuseOptions = {
      keys,
      threshold: 0.3,
      ignoreLocation: true,
    }
    return new Fuse(tokensToShow, fuseOptions)
  }, [tokensToShow, isChainAbstractionView])

  const filteredTokens = useMemo(() => {
    if (searchQuery.length === 0) {
      return tokensToShow
    }
    let fuse = simpleFuse
    if (searchQuery.length >= 8) {
      fuse = extendedFuse
    }
    const searchResult = fuse.search(searchQuery)
    return searchResult.map((result) => result.item)
  }, [searchQuery, tokensToShow, simpleFuse, extendedFuse])

  const tokenGroups = useMemo(() => {
    return [
      {
        type: 'whitelisted' as const,
        items: filteredTokens,
        Component: TokenCardWrapper,
        headerComponent: (
          <div
            key='all-tokens-heading'
            className='mb-[8px] px-6 flex flex-row justify-start items-center gap-[4px] text-muted-foreground'
          >
            <span className='font-bold text-xs'>All tokens</span>
          </div>
        ),
      },
    ]
  }, [filteredTokens])

  const handleOnTokenSelect = useCallback(
    (token: SourceToken) => {
      onTokenSelect(token)
    },
    [onTokenSelect],
  )

  if (activeNetwork !== 'testnet' && showFor === 'destination') {
    return (
      <SelectDestinationSheet
        isOpen={isOpen}
        destinationAssets={destinationAssets.filter(
          (asset) =>
            getKeyToUseForDenoms(asset.skipAsset.denom, asset.skipAsset.originChainId) !==
            getKeyToUseForDenoms(
              destinationToken?.skipAsset?.denom ?? '',
              destinationToken?.skipAsset?.originChainId ?? '',
            ),
        )}
        destinationToken={destinationToken}
        onClose={() => {
          onClose()
        }}
        onTokenSelect={handleOnTokenSelect}
        loadingTokens={loadingTokens}
        compassTokenTagsStore={compassTokenTagsStore}
        marketDataStore={marketDataStore}
      />
    )
  }

  return (
    <BottomModal
      title={'You pay'}
      onClose={() => {
        onClose()
      }}
      isOpen={isOpen}
      fullScreen={true}
      className='!p-6 !pb-0 h-full'
      containerClassName='bg-secondary-50'
    >
      <div className='flex flex-col items-center w-full h-full'>
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          data-testing-id='switch-token-input-search'
          placeholder={isChainAbstractionView ? 'Search Token or Chain' : 'Search Token'}
          onClear={() => setSearchQuery('')}
        />

        <div className='w-full h-full overflow-y-scroll'>
          {loadingTokens ? (
            <>
              <div
                key='all-tokens-heading'
                className='mb-[8px] px-6 flex flex-row justify-start items-center gap-[4px] text-gray-400'
              >
                <span className='font-bold text-xs'>All tokens</span>
              </div>
              {[...Array(5)].map((_, index) => (
                <React.Fragment key={index}>
                  <TokenCardSkeleton />
                  {index !== 4 && (
                    <div className='border-b mx-6 border-gray-100 dark:border-gray-850' />
                  )}
                </React.Fragment>
              ))}
            </>
          ) : filteredTokens.length === 0 ? (
            <div className='py-[80px] px-4 w-full flex-col flex  justify-center items-center gap-4'>
              <MagnifyingGlassMinus
                size={64}
                className='dark:text-gray-50 text-gray-900 p-5 rounded-full bg-secondary-200'
              />
              <div className='flex flex-col justify-start items-center w-full gap-4'>
                <div className='text-lg text-center font-bold !leading-[21.5px] dark:text-white-100'>
                  No tokens found
                </div>
                <div className='text-sm font-normal !leading-[22.4px] text-gray-400 dark:text-gray-400 text-center'>
                  We couldn’t find a match. Try searching again or use a different keyword.
                </div>
              </div>
            </div>
          ) : (
            <>
              <GroupedVirtuoso
                style={{ flexGrow: '1', width: '100%' }}
                groupContent={() => <div className='w-[1px] h-[1px] bg-transparent'></div>} //This is to avoid virtuoso errors in console logs
                groupCounts={tokenGroups.map((group) => group.items.length)}
                className='scrollbar'
                itemContent={(index, groupIndex) => {
                  const group = tokenGroups[groupIndex]
                  const { Component } = group
                  const item = group.items[index]
                  return (
                    <Component
                      key={`${item.coinMinimalDenom}-${item.chain}-${item.ibcChainInfo?.pretty_name}-${item.skipAsset?.chainId}-${item.skipAsset?.denom}`}
                      index={index}
                      token={item}
                      verified={false}
                      selectedToken={selectedToken}
                      selectedChain={selectedChain}
                      onTokenSelect={handleOnTokenSelect}
                      tokensLength={group.items.length}
                      isChainAbstractionView={isChainAbstractionView}
                      marketDataStore={marketDataStore}
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
