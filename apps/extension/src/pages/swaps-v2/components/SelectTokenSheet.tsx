import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { RootDenomsStore, WhitelistedFactoryTokensStore } from '@leapwallet/cosmos-wallet-store'
import BottomModal from 'components/new-bottom-modal'
import { SearchInput } from 'components/ui/input/search-input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'components/ui/tooltip'
import { EventName } from 'config/analytics'
import Fuse from 'fuse.js'
import { useDefaultTokenLogo } from 'hooks'
import { CompassIcon } from 'icons/compass-icon'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GroupedVirtuoso } from 'react-virtuoso'
import { popularTokensStore } from 'stores/chain-infos-store'
import { SourceChain, SourceToken } from 'types/swap'
import { cn } from 'utils/cn'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'

import { useSwapContext } from '../context'
import { useAllChainsPlaceholder } from '../hooks/useAllChainsPlaceholder'
import { TokenAssociatedChain } from './ChainsList'
import { SelectChainSheet } from './SelectChainSheet'
import { TokenCardSkeleton } from './TokenCard'
import { TokenCardWrapper } from './TokenCardWrapper'

export const priorityChainsIds = [
  ChainInfos.cosmos.key,
  ChainInfos.ethereum.key,
  ChainInfos.base.key,
  ChainInfos.arbitrum.key,
  ChainInfos.polygon.key,
]

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
  loadingChains: boolean
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
  loadingChains,
}: SelectTokenSheetProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSelectChainOpen, setIsSelectChainOpen] = useState(false)
  const allChainsPlaceholder = useAllChainsPlaceholder()
  const [selectedFilteredChain, setSelectedFilteredChain] = useState<
    TokenAssociatedChain | undefined
  >(allChainsPlaceholder)
  const { chainsToShow } = useSwapContext()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isSourceTokenMovement = useMemo(() => {
    return sourceToken?.skipAsset?.chainId === ChainInfos.movement.chainId
  }, [sourceToken?.skipAsset?.chainId])

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 200)
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

  const cosmosChainIds = useMemo(() => {
    return chainsToShow
      .filter((chain) => chain.chainType === 'cosmos')
      .map((chain) => chain.chainId)
  }, [chainsToShow])

  const tokensToShow = useMemo(() => {
    let tokensToShow: SourceToken[]
    switch (showFor) {
      case 'source': {
        tokensToShow = sourceAssets
        break
      }

      case 'destination': {
        tokensToShow = destinationAssets.filter((asset) => !asset.skipAsset.denom.includes('ibc/'))
        break
      }

      default:
        tokensToShow = []
        break
    }
    return tokensToShow ?? []
  }, [showFor, destinationAssets, sourceAssets])

  const filteredTokensToShow = useMemo(() => {
    if (selectedFilteredChain && selectedFilteredChain.chain.chainId !== 'all') {
      if (selectedFilteredChain.chain.chainId !== ChainInfos.cosmos.chainId) {
        return tokensToShow.filter(
          (asset) => asset.skipAsset.chainId === selectedFilteredChain.chain.chainId,
        )
      }

      return tokensToShow.filter((asset) => cosmosChainIds.includes(asset.skipAsset.chainId))
    }
    return tokensToShow
  }, [tokensToShow, selectedFilteredChain, cosmosChainIds])

  const chainsToShowForPlaceholders = useMemo(() => {
    if (showFor === 'source') {
      return chainsToShow.filter((chain) =>
        tokensToShow.some((token) => {
          if (chain.key === 'cosmos') {
            return cosmosChainIds.includes(token.skipAsset.chainId)
          }
          return token.skipAsset.chainId === chain.chainId
        }),
      )
    }
    return chainsToShow.filter((chain) => {
      return isSourceTokenMovement
        ? chain.chainId === ChainInfos.movement.chainId
        : chain.key !== 'movement'
    })
  }, [showFor, chainsToShow, tokensToShow, cosmosChainIds, isSourceTokenMovement])

  useEffect(() => {
    if (!sourceToken) {
      setSelectedFilteredChain(allChainsPlaceholder)
      return
    }
    if (!sourceToken?.skipAsset?.chainId?.startsWith('aptos-')) {
      setSelectedFilteredChain(allChainsPlaceholder)
      return
    }
    const allChains = showFor === 'source' ? chainsToShowForPlaceholders : chainsToShow
    const chain = allChains.find((chain) => chain.chainId === sourceToken.skipAsset.chainId)
    if (!chain) {
      setSelectedFilteredChain(allChainsPlaceholder)
      return
    }
    setSelectedFilteredChain({ chain })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceToken, chainsToShowForPlaceholders, chainsToShow, showFor])

  const filterChainPlaceholders = useMemo(() => {
    const NUM_OF_CHAINS_TO_SHOW = 5
    const allPlaceholders: (
      | TokenAssociatedChain
      | { id: string; label: string; tooltip: string }
    )[] = []
    if (!(isSourceTokenMovement && showFor === 'destination') && allChainsPlaceholder.chain) {
      allPlaceholders.push(allChainsPlaceholder)
    }

    const priorityChainsPushed: SupportedChain[] = []

    priorityChainsIds.forEach((chainKey) => {
      if (allPlaceholders.length >= NUM_OF_CHAINS_TO_SHOW) {
        return
      }
      const chain = chainsToShowForPlaceholders.find((chain) => chain.key === chainKey)
      if (chain) {
        if (chain.chainId === ChainInfos.cosmos.chainId) {
          allPlaceholders.push({
            chain: {
              ...chain,
              chainName: 'Cosmos',
              icon: Images.Logos.Cosmos,
            },
          })
        } else {
          allPlaceholders.push({ chain })
        }
        priorityChainsPushed.push(chainKey)
      }
    })

    const remainingNonCosmosChains = chainsToShowForPlaceholders.filter(
      (chain) => chain.chainType !== 'cosmos' && !priorityChainsPushed.includes(chain.key),
    )

    if (remainingNonCosmosChains.length > 0) {
      const remainingUpfrontPlaceholders = Math.max(
        NUM_OF_CHAINS_TO_SHOW - (allPlaceholders?.length ?? 0),
        0,
      )
      if (remainingUpfrontPlaceholders > 0) {
        const remainingChainsToShowUpfront = remainingNonCosmosChains.slice(
          0,
          remainingUpfrontPlaceholders,
        )
        allPlaceholders.push(
          ...remainingChainsToShowUpfront.map((chain) => ({
            chain,
          })),
        )
      }
      const numberOfRemainingChains = Math.max(
        remainingNonCosmosChains.length - remainingUpfrontPlaceholders,
        0,
      )
      if (numberOfRemainingChains > 0) {
        allPlaceholders.push({
          id: 'remaining-chains',
          tooltip: `View all +${numberOfRemainingChains} networks`,
          label: `+${numberOfRemainingChains}`,
        })
      }
    }
    return allPlaceholders
  }, [allChainsPlaceholder, chainsToShowForPlaceholders, isSourceTokenMovement, showFor])

  const simpleFuse = useMemo(() => {
    const keys = ['symbol', 'name']
    const fuseOptions = {
      keys,
      threshold: 0.3,
      ignoreLocation: true,
    }
    return new Fuse(filteredTokensToShow, fuseOptions)
  }, [filteredTokensToShow])

  const extendedFuse = useMemo(() => {
    const keys = ['symbol', 'name', 'coinMinimalDenom', 'ibcDenom', 'skipAsset.evmTokenContract']
    if (isChainAbstractionView) {
      keys.push('tokenBalanceOnChain', 'chain')
    }
    const fuseOptions = {
      keys,
      threshold: 0.3,
      ignoreLocation: true,
    }
    return new Fuse(filteredTokensToShow, fuseOptions)
  }, [filteredTokensToShow, isChainAbstractionView])

  const sortByPopularity = useCallback(
    (tokens: SourceToken[]) => {
      const chainKey = selectedFilteredChain?.chain?.key
      if (!chainKey || showFor === 'source') {
        return tokens
      }
      const popularTokens = popularTokensStore.popularTokensFromS3[chainKey]
      if (!popularTokens) {
        return tokens
      }

      const tokensWithZeroAmount: SourceToken[] = []
      const tokensWithBalance: SourceToken[] = []

      tokens.forEach((token) => {
        if (!token?.amount || Number(token.amount) === 0) {
          tokensWithZeroAmount.push(token)
        } else {
          tokensWithBalance.push(token)
        }
      })

      let filteredPopularTokens: SourceToken[] = []
      const filteredNonPopularTokens: SourceToken[] = []
      tokensWithZeroAmount.forEach((t) => {
        const popularToken = popularTokens.find(
          (token) => t.skipAsset?.denom === token?.denom && t.skipAsset?.chainId === token?.chainId,
        )
        if (popularToken) {
          filteredPopularTokens.push(t)
        } else {
          filteredNonPopularTokens.push(t)
        }
      })
      filteredPopularTokens = filteredPopularTokens.sort((a, b) => {
        return (
          popularTokens.findIndex(
            (token) =>
              token?.denom === a.skipAsset?.denom && token?.chainId === a.skipAsset?.chainId,
          ) -
          popularTokens.findIndex(
            (token) =>
              token?.denom === b.skipAsset?.denom && token?.chainId === b.skipAsset?.chainId,
          )
        )
      })
      return [...tokensWithBalance, ...filteredPopularTokens, ...filteredNonPopularTokens]
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedFilteredChain?.chain?.key, popularTokensStore.popularTokensFromS3, showFor],
  )

  const filteredTokens = useMemo(() => {
    if (searchQuery.length === 0) {
      return sortByPopularity(filteredTokensToShow)
    }
    let fuse = simpleFuse
    if (searchQuery.length >= 8) {
      fuse = extendedFuse
    }
    const searchResult = fuse.search(searchQuery)
    return sortByPopularity(searchResult.map((result) => result.item))
  }, [searchQuery, filteredTokensToShow, simpleFuse, extendedFuse, sortByPopularity])

  const chainsToShowWithAssociatedTokens = useMemo(() => {
    const chainsToShowWithoutCosmosChains: { chain: SourceChain }[] = []
    chainsToShowForPlaceholders
      .filter(
        (chain) => chain.chainType !== 'cosmos' || chain.chainId === ChainInfos.cosmos.chainId,
      )
      .forEach((chain) => {
        if (chain.chainId === ChainInfos.cosmos.chainId) {
          chainsToShowWithoutCosmosChains.push({
            chain: {
              ...chain,
              icon: Images.Logos.Cosmos,
              chainName: 'Cosmos',
            },
          })
        } else {
          chainsToShowWithoutCosmosChains.push({ chain })
        }
      })
    return chainsToShowWithoutCosmosChains
  }, [chainsToShowForPlaceholders])

  const tokenGroups = useMemo(() => {
    return [
      {
        type: 'whitelisted' as const,
        items: filteredTokens,
        Component: TokenCardWrapper,
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

  return (
    <BottomModal
      title={`You ${showFor === 'source' ? 'pay' : 'get'}`}
      onClose={() => {
        emitMixpanelDropdownCloseEvent()
        onClose()
      }}
      fullScreen={true}
      isOpen={isOpen}
      className='p-0'
    >
      <div className='flex flex-col items-center w-full h-full'>
        <div className='mt-6 px-6 w-full'>
          <SearchInput
            value={searchQuery}
            ref={searchInputRef}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testing-id='switch-token-input-search'
            placeholder={
              isChainAbstractionView ? 'Search by token name or address' : 'Search Token'
            }
            onClear={() => setSearchQuery('')}
          />
        </div>

        {/* Filters by chain */}
        <div className='flex flex-col items-start justify-start px-6 w-full mt-7'>
          <div>
            <span className='text-xs !leading-[19.2px] text-muted-foreground'>
              Select ecosystem:{' '}
            </span>
            <span className='text-xs font-bold !leading-[19.2px] text-foreground'>
              {selectedFilteredChain?.chain.chainName}
            </span>
          </div>
          <div className='flex gap-2 items-center w-full overflow-x-auto hide-scrollbar py-[2px] mt-3'>
            <TooltipProvider delayDuration={100}>
              {filterChainPlaceholders.map((chain) => {
                const key = 'id' in chain ? chain.id : chain.chain?.chainId
                const tooltip = 'id' in chain ? chain.tooltip : chain.chain.chainName
                return (
                  <Tooltip key={key}>
                    <TooltipContent>
                      <span className='text-xs font-medium !leading-[19.2px] text-secondary-800'>
                        {tooltip}
                      </span>
                    </TooltipContent>
                    <TooltipTrigger asChild>
                      <button
                        key={key}
                        className={cn(
                          'flex items-center justify-center w-13 shrink-0 py-2 px-[10px] rounded-xl border',
                          selectedFilteredChain?.chain.chainId === key
                            ? 'border-foreground bg-secondary-200'
                            : 'border-secondary-300',
                        )}
                        onClick={() => {
                          if ('chain' in chain) {
                            setSelectedFilteredChain(chain)
                            return
                          }
                          setIsSelectChainOpen(true)
                        }}
                      >
                        {'chain' in chain ? (
                          <img
                            src={chain.chain?.icon || chain.chain?.logoUri || defaultTokenLogo}
                            className='w-[28px] h-[28px]'
                            onError={imgOnError(defaultTokenLogo)}
                          />
                        ) : (
                          <div className='w-[28px] h-[28px] flex items-center justify-center'>
                            <span className='text-[16px] font-bold !leading-[22.4px] text-foreground'>
                              {chain.label}
                            </span>
                          </div>
                        )}
                      </button>
                    </TooltipTrigger>
                  </Tooltip>
                )
              })}
            </TooltipProvider>
          </div>
        </div>

        {/* List of tokens */}
        <div
          className='w-full mt-7'
          style={{ height: (isSidePanel() ? window.innerHeight : 600) - 200, overflowY: 'scroll' }}
        >
          {loadingTokens ? (
            <>
              <div
                key='all-tokens-heading'
                className='px-6 flex flex-row justify-start items-center gap-[4px] text-gray-400'
              >
                <span className='font-bold text-xs'>Your tokens</span>
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
            <div className='w-full px-6 h-full pb-6'>
              <div className='h-full px-5 w-full flex-col flex justify-center items-center gap-4 border border-secondary-200 rounded-2xl'>
                <div className='p-2 bg-secondary-200 rounded-full'>
                  <CompassIcon size={40} className='text-muted-foreground' />
                </div>
                <div className='flex flex-col justify-start items-center w-full gap-3'>
                  <div className='text-[18px] !leading-[24px] text-center font-bold text-foreground'>
                    No tokens found
                  </div>
                  <div className='text-xs !leading-[16px] text-secondary-800 text-center'>
                    We couldn&apos;t find a match. Try searching again or use a different keyword.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div
                key='all-tokens-heading'
                className='px-6 flex flex-row justify-start items-center gap-[4px] text-gray-400 mb-1'
              >
                <span className='font-bold text-xs'>Your tokens</span>
              </div>
              <GroupedVirtuoso
                style={{ flexGrow: '1', width: '100%', height: 'calc(100% - 20px)' }}
                groupContent={() => <div className='w-[1px] h-[1px] bg-transparent'></div>} //This is to avoid virtuoso errors in console logs
                groupCounts={tokenGroups.map((group) => group.items.length)}
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
                      showChainNames={[
                        allChainsPlaceholder.chain.chainId,
                        ChainInfos.cosmos.chainId,
                      ].includes(selectedFilteredChain?.chain?.chainId ?? '')}
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
        priorityChainsIds={priorityChainsIds}
        loadingChains={loadingChains}
      />
    </BottomModal>
  )
}
