import { getKeyToUseForDenoms, useSelectedNetwork } from '@leapwallet/cosmos-wallet-hooks'
import {
  MarketDataStore,
  RootDenomsStore,
  WhitelistedFactoryTokensStore,
} from '@leapwallet/cosmos-wallet-store'
import { MagnifyingGlassMinus } from '@phosphor-icons/react'
import BottomModal from 'components/bottom-modal'
import { SearchInput } from 'components/search-input'
import { EventName } from 'config/analytics'
import Fuse from 'fuse.js'
import { useDefaultTokenLogo } from 'hooks'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { GroupedVirtuoso } from 'react-virtuoso'
import { marketDataStore } from 'stores/balance-store'
import { compassTokenTagsStore } from 'stores/denoms-store-instance'
import { SourceChain, SourceToken } from 'types/swap'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'

import { useSwapContext } from '../context'
import { useAllChainsPlaceholder } from '../hooks/useAllChainsPlaceholder'
import { TokenAssociatedChain } from './ChainsList'
import { SelectChainSheet } from './SelectChainSheet'
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
  const [isSelectChainOpen, setIsSelectChainOpen] = useState(false)
  const allChainsPlaceholder = useAllChainsPlaceholder()
  const [selectedFilteredChain, setSelectedFilteredChain] = useState<
    TokenAssociatedChain | undefined
  >(allChainsPlaceholder)
  const activeNetwork = useSelectedNetwork()
  const { chainsToShow } = useSwapContext()

  useEffect(() => {
    if (!sourceToken) {
      setSelectedFilteredChain(undefined)
      return
    }
    if (!sourceToken?.skipAsset?.chainId?.startsWith('aptos-')) {
      setSelectedFilteredChain(undefined)
      return
    }
    const chain = chainsToShow.find((chain) => chain.chainId === sourceToken.skipAsset.chainId)
    if (!chain) {
      setSelectedFilteredChain(undefined)
      return
    }
    setSelectedFilteredChain({ chain })
  }, [sourceToken, chainsToShow])

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

  const chainsToShowWithAssociatedTokens = useMemo(() => {
    return chainsToShow.map((chain) => ({
      chain,
    }))
  }, [chainsToShow])

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
  const defaultTokenLogo = useDefaultTokenLogo()

  const emitMixpanelDropdownCloseEvent = useCallback(
    (tokenSelected?: string) => {
      try {
        mixpanel.track(EventName.DropdownClosed, {
          dropdownType: showFor === 'source' ? 'Source Token' : 'Destination Token',
          tokenSelected,
          searchField: searchQuery,
        })
      } catch (error) {
        // ignore
      }
    },
    [searchQuery, showFor],
  )

  const handleOnTokenSelect = useCallback(
    (token: SourceToken) => {
      onTokenSelect(token)
      const chain = chainsToShow.find((chain) => chain.chainId === token.skipAsset.chainId)
      emitMixpanelDropdownCloseEvent(`${token.symbol} (${chain?.chainName})`)
    },
    [chainsToShow, emitMixpanelDropdownCloseEvent, onTokenSelect],
  )

  const onSelectChainFilterClick = useCallback(() => {
    setIsSelectChainOpen(true)
  }, [])

  if (isCompassWallet() && activeNetwork !== 'testnet' && showFor === 'destination') {
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
          emitMixpanelDropdownCloseEvent()
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
        emitMixpanelDropdownCloseEvent()
        onClose()
      }}
      isOpen={isOpen}
      fullScreen={true}
      className='!p-6 !pb-0 h-full'
      containerClassName='bg-secondary-50'
    >
      <div className='flex flex-col items-center w-full h-full'>
        <div className='flex flex-col items-center w-full pb-2'>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testing-id='switch-token-input-search'
            placeholder={isChainAbstractionView ? 'Search Token or Chain' : 'Search Token'}
            onClear={() => setSearchQuery('')}
            divClassName='rounded-2xl w-full flex items-center gap-[10px] bg-gray-50 dark:bg-gray-900 py-3 pr-3 pl-4 dark:focus-within:border-white-100 hover:border-secondary-400 focus-within:border-black-100 border border-transparent'
            inputClassName='flex flex-grow text-base text-gray-400 outline-none bg-white-0 font-bold dark:text-white-100 text-md placeholder:font-medium dark:placeholder:text-gray-400  !leading-[21px]'
          />
          {showFor === 'destination' ? (
            <div
              className='flex items-center cursor-pointer bg-gray-50 dark:bg-gray-900 h-12 rounded-3xl px-3 py-2'
              onClick={onSelectChainFilterClick}
            >
              <img
                src={selectedFilteredChain?.chain.icon || defaultTokenLogo}
                className='w-[28px] h-[28px]'
                onError={imgOnError(defaultTokenLogo)}
              />
              <img src={Images.Misc.FilledArrowDown} className='h-1.5 w-4 ml-2' />
            </div>
          ) : null}
        </div>

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
      <SelectChainSheet
        isOpen={isSelectChainOpen}
        onClose={() => {
          setIsSelectChainOpen(false)
        }}
        chainsToShow={chainsToShowWithAssociatedTokens}
        selectedChain={selectedFilteredChain?.chain}
        onChainSelect={(chain) => {
          setSelectedFilteredChain(chain)
          setIsSelectChainOpen(false)
        }}
        selectedToken={null}
        showAllChainsOption
      />
    </BottomModal>
  )
}
