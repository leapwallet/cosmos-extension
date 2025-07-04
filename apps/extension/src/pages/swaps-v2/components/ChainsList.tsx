import classNames from 'classnames'
import Text from 'components/text'
import { SearchInput } from 'components/ui/input/search-input'
import Fuse from 'fuse.js'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { CompassIcon } from 'icons/compass-icon'
import { SwapsCheckIcon } from 'icons/swaps-check-icon'
import { GenericLight } from 'images/logos'
import { observer } from 'mobx-react-lite'
import React, { forwardRef, useEffect, useMemo, useRef } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Virtuoso } from 'react-virtuoso'
import { SourceChain, SourceToken } from 'types/swap'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'

export type TokenAssociatedChain = {
  chain: SourceChain
  asset?: SourceToken
}

export type ListChainsProps = {
  onChainSelect: (props: TokenAssociatedChain) => void
  selectedChain?: SourceChain
  selectedToken: SourceToken | null
  chainsToShow?: TokenAssociatedChain[]
  setSearchedChain: (chain: string) => void
  searchedChain: string
  loadingChains: boolean
}

export function ChainsListSkeleton({ index, isLast }: { index: number; isLast: boolean }) {
  return (
    <React.Fragment key={`chain-list-skeleton-${index}`}>
      <div className='flex items-center py-4 mx-6 z-0 !h-[72px]'>
        <div className='w-9 h-9'>
          <Skeleton
            circle
            className='w-9 h-9'
            containerClassName='block !leading-none'
            style={{
              zIndex: 0,
            }}
          />
        </div>
        <div className='max-w-[80px] z-0 ml-4'>
          <Skeleton width={80} className='z-0 h-[17px]' />
        </div>
      </div>
      {!isLast && <div className='border-b border-gray-100 dark:border-gray-850 mx-6' />}
    </React.Fragment>
  )
}

export function ChainCard({
  itemsLength,
  tokenAssociatedChain,
  index,
  setSearchedChain,
  onChainSelect,
  selectedChain,
  selectedToken,
}: {
  tokenAssociatedChain: TokenAssociatedChain
  index: number
  itemsLength: number
  setSearchedChain: (chain: string) => void
  onChainSelect: (props: TokenAssociatedChain) => void
  selectedChain?: SourceChain
  selectedToken: SourceToken | null
}) {
  const img = tokenAssociatedChain.chain.icon || tokenAssociatedChain.chain.logoUri || GenericLight
  const chainName = tokenAssociatedChain.chain.chainName
  const isLast = index === itemsLength - 1
  const defaultTokenLogo = useDefaultTokenLogo()

  const isSelected =
    !!selectedChain &&
    selectedChain.key === tokenAssociatedChain.chain.key &&
    (!selectedToken ||
      selectedToken.skipAsset?.denom === tokenAssociatedChain.asset?.skipAsset?.denom)

  return (
    <React.Fragment
      key={`${tokenAssociatedChain.chain.chainName}-${tokenAssociatedChain.asset?.skipAsset?.denom}-${index}`}
    >
      <div
        onClick={() => {
          setSearchedChain('')
          onChainSelect(tokenAssociatedChain)
        }}
        className={classNames('flex flex-1 items-center cursor-pointer px-6', isLast ? '' : 'mb-3')}
      >
        <div className='flex items-center flex-1 bg-secondary-100 hover:bg-secondary-200 rounded-xl px-4 py-2'>
          <div className='flex items-center justify-center h-10 w-10 mr-3 shrink-0'>
            <img
              src={img || defaultTokenLogo}
              className='h-8 w-8 rounded-full'
              onError={imgOnError(defaultTokenLogo)}
            />
          </div>
          <Text
            className='font-bold text-base !leading-[22px] text-foreground'
            data-testing-id={`switch-chain-${chainName.toLowerCase()}-ele`}
          >
            {chainName}
          </Text>
          {isSelected && <SwapsCheckIcon size={20} className='text-accent-green ml-auto size-6' />}
        </div>
      </div>
    </React.Fragment>
  )
}

const ChainsListView = forwardRef<HTMLInputElement, ListChainsProps>(
  (
    {
      onChainSelect,
      selectedChain,
      selectedToken,
      chainsToShow,
      searchedChain,
      setSearchedChain,
      loadingChains,
    }: ListChainsProps,
    ref,
  ) => {
    const chainsFuse = useMemo(() => {
      return new Fuse(chainsToShow ?? [], {
        threshold: 0.3,
        keys: ['chain.chainName'],
        shouldSort: false,
      })
    }, [chainsToShow])

    const filteredChains = useMemo(() => {
      if (!searchedChain) {
        return chainsToShow ?? []
      }
      return chainsFuse?.search(searchedChain).map((chain) => chain.item) ?? []
    }, [chainsFuse, searchedChain, chainsToShow])

    return (
      <>
        <div className='flex flex-col items-center px-6 pt-6 pb-7'>
          <SearchInput
            value={searchedChain}
            ref={ref}
            onChange={(e) => setSearchedChain(e.target.value)}
            data-testing-id='switch-chain-input-search'
            placeholder='Search by chain name'
            onClear={() => setSearchedChain('')}
          />
        </div>

        <div
          className={classNames('w-full pb-6', {
            'mt-3': filteredChains.length === 0 && !loadingChains,
          })}
          style={{ height: (isSidePanel() ? window.innerHeight : 600) - 160, overflowY: 'scroll' }}
        >
          {loadingChains ? (
            Array.from({ length: 5 }).map((_, index) => (
              <ChainsListSkeleton key={index} index={index} isLast={index === 4} />
            ))
          ) : filteredChains.length === 0 ? (
            <div className='w-full px-6 h-full pb-6'>
              <div className='h-full px-5 w-full flex-col flex justify-center items-center gap-4 border border-secondary-200 rounded-2xl'>
                <div className='p-2 bg-secondary-200 rounded-full'>
                  <CompassIcon size={40} className='text-muted-foreground' />
                </div>
                <div className='flex flex-col justify-start items-center w-full gap-3'>
                  <div className='text-[18px] !leading-[24px] text-center font-bold text-foreground'>
                    No chains found
                  </div>
                  <div className='text-xs !leading-[16px] text-secondary-800 text-center'>
                    We couldn&apos;t find a match. Try searching again or use a different keyword.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Virtuoso
                data={filteredChains}
                style={{ flexGrow: '1', width: '100%' }}
                itemContent={(index, tokenAssociatedChain) => (
                  <ChainCard
                    key={`${tokenAssociatedChain?.chain?.chainName}-${tokenAssociatedChain?.asset?.skipAsset.denom}`}
                    tokenAssociatedChain={tokenAssociatedChain}
                    index={index}
                    itemsLength={filteredChains.length}
                    selectedChain={selectedChain}
                    selectedToken={selectedToken}
                    onChainSelect={onChainSelect}
                    setSearchedChain={setSearchedChain}
                  />
                )}
              />
            </>
          )}
        </div>
      </>
    )
  },
)

ChainsListView.displayName = 'ChainsListView'

export const ChainsList = observer(ChainsListView)
